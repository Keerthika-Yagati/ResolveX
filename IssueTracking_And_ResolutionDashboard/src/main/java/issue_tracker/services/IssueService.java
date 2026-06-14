package issue_tracker.services;

import issue_tracker.models.Issues;
import issue_tracker.models.Users;
import issue_tracker.repository.IssuesRepository;
import issue_tracker.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IssueService {

    // Role constants for better readability
    private static final int ROLE_USER = 1;
    private static final int ROLE_DEVELOPER = 2;
    private static final int ROLE_ADMIN = 3;
    
    // MongoDB Node.js backend URL
    private static final String NODE_URL = "http://localhost:8002";
    
    // HTTP Client for calling Node.js
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    IssuesRepository IR;

    @Autowired
    UsersRepository UR;

    @Autowired
    JwtService JWT;

    // USER creates an issue
    public Object createIssue(Map<String, Object> data, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Users user = (Users) UR.findByEmail(email);

            // Check if user has USER role (1)
            if (user.getRole() != ROLE_USER) {
                throw new Exception("Only Users can create issues");
            }

            // Validate required fields
            if (!data.containsKey("title") || !data.containsKey("description") || !data.containsKey("priority")) {
                throw new Exception("Missing required fields: title, description, or priority");
            }

            Issues issue = new Issues();
            issue.setTitle(data.get("title").toString());
            issue.setDescription(data.get("description").toString());
            issue.setPriority(data.get("priority").toString());
            issue.setCreatedBy(user.getId());

            IR.save(issue);
            
            // Record history in MongoDB
            recordHistory(issue.getId(), "CREATED", null, "open", null, user.getFullname(), token);
            
            // Create notification for issue creator
            createNotification(user.getId(), "Issue Created", 
                "Your issue \"" + issue.getTitle() + "\" has been created successfully", 
                "ISSUE_CREATED", issue.getId(), user.getFullname(), token);
            
            response.put("code", 200);
            response.put("message", "Issue created successfully");
            response.put("issueId", issue.getId());
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // Get issues created by the logged-in user
    public Object getMyIssues(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Users user = (Users) UR.findByEmail(email);

            List<Issues> issues = IR.getIssuesByUser(user.getId());
            response.put("code", 200);
            response.put("issues", issues);
            response.put("count", issues.size());
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ADMIN gets all issues
    public Object getAllIssues(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Users user = (Users) UR.findByEmail(email);

            // Check if user has ADMIN role (3)
            if (user.getRole() != ROLE_ADMIN) {
                throw new Exception("Access denied. Admins only.");
            }

            List<Issues> issues = IR.getAllIssues();
            response.put("code", 200);
            response.put("issues", issues);
            response.put("count", issues.size());
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ADMIN assigns issue to a developer
    public Object assignIssue(Long issueId, Map<String, Object> data, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Users admin = (Users) UR.findByEmail(email);

            // Check if user has ADMIN role (3)
            if (admin.getRole() != ROLE_ADMIN) {
                throw new Exception("Access denied. Admins only.");
            }

            // Get developer ID from request
            Long developerId = Long.valueOf(data.get("developerId").toString());
            
            // Check if developer exists
            if (!UR.existsById(developerId)) {
                throw new Exception("Developer not found with ID: " + developerId);
            }
            
            Users developer = UR.findById(developerId).get();

            // Check if user has DEVELOPER role (2)
            if (developer.getRole() != ROLE_DEVELOPER) {
                throw new Exception("Assigned user must be a Developer");
            }

            // Check if issue exists
            if (!IR.existsById(issueId)) {
                throw new Exception("Issue not found with ID: " + issueId);
            }
            
            Issues issue = IR.findById(issueId).get();
            
            // Check if issue is already closed
            if (issue.getStatus().equals("closed")) {
                throw new Exception("Cannot assign a closed issue");
            }
            
            String oldStatus = issue.getStatus();
            issue.setAssignedTo(developerId);
            issue.setStatus("assigned");
            IR.save(issue);

            // Record history in MongoDB
            recordHistory(issueId, "ASSIGNED", oldStatus, "assigned", developerId, admin.getFullname(), token);
            
            // Create notification for the developer
            createNotification(developerId, "Issue Assigned", 
                "Issue \"" + issue.getTitle() + "\" has been assigned to you by " + admin.getFullname(), 
                "ISSUE_ASSIGNED", issueId, admin.getFullname(), token);
            
            // Create notification for issue creator
            Users creator = UR.findById(issue.getCreatedBy()).get();
            createNotification(creator.getId(), "Issue Assigned", 
                "Your issue \"" + issue.getTitle() + "\" has been assigned to " + developer.getFullname(), 
                "ISSUE_ASSIGNED", issueId, admin.getFullname(), token);

            response.put("code", 200);
            response.put("message", "Issue assigned to developer successfully");
            response.put("issueId", issueId);
            response.put("assignedTo", developerId);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // DEVELOPER gets issues assigned to them
    public Object getMyAssignedIssues(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Users dev = (Users) UR.findByEmail(email);

            // Check if user has DEVELOPER role (2)
            if (dev.getRole() != ROLE_DEVELOPER) {
                throw new Exception("Access denied. Developers only.");
            }

            List<Issues> issues = IR.getIssuesByDeveloper(dev.getId());
            response.put("code", 200);
            response.put("issues", issues);
            response.put("count", issues.size());
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // DEVELOPER updates issue status
    public Object updateIssueStatus(Long issueId, Map<String, Object> data, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Users dev = (Users) UR.findByEmail(email);

            // Check if user has DEVELOPER role (2)
            if (dev.getRole() != ROLE_DEVELOPER) {
                throw new Exception("Access denied. Developers only.");
            }

            // Check if issue exists
            if (!IR.existsById(issueId)) {
                throw new Exception("Issue not found with ID: " + issueId);
            }
            
            Issues issue = IR.findById(issueId).get();

            // Check if issue is assigned to this developer
            if (issue.getAssignedTo() == null || !issue.getAssignedTo().equals(dev.getId())) {
                throw new Exception("This issue is not assigned to you");
            }

            // Get new status from request
            String newStatus = data.get("status").toString();
            
            // Validate status transition
            String currentStatus = issue.getStatus();
            if (!isValidStatusTransition(currentStatus, newStatus)) {
                throw new Exception("Invalid status transition from " + currentStatus + " to " + newStatus);
            }
            
            String oldStatus = issue.getStatus();
            issue.setStatus(newStatus);
            IR.save(issue);

            // Record history in MongoDB
            recordHistory(issueId, "STATUS_CHANGED", oldStatus, newStatus, issue.getAssignedTo(), dev.getFullname(), token);
            
            // Create notification for issue creator
            Users creator = UR.findById(issue.getCreatedBy()).get();
            createNotification(creator.getId(), "Status Updated", 
                "Issue \"" + issue.getTitle() + "\" status changed from " + oldStatus + " to " + newStatus + " by " + dev.getFullname(), 
                "STATUS_CHANGED", issueId, dev.getFullname(), token);
            
            // If status is resolved, notify admin
            if (newStatus.equals("resolved")) {
                List<Users> admins = UR.findAll(); // Get all admins
                for (Users admin : admins) {
                    if (admin.getRole() == ROLE_ADMIN) {
                        createNotification(admin.getId(), "Issue Resolved", 
                            "Issue \"" + issue.getTitle() + "\" has been resolved by " + dev.getFullname(), 
                            "STATUS_CHANGED", issueId, dev.getFullname(), token);
                    }
                }
            }

            response.put("code", 200);
            response.put("message", "Issue status updated to " + newStatus);
            response.put("issueId", issueId);
            response.put("newStatus", newStatus);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ADMIN closes an issue
    public Object closeIssue(Long issueId, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Users admin = (Users) UR.findByEmail(email);

            // Check if user has ADMIN role (3)
            if (admin.getRole() != ROLE_ADMIN) {
                throw new Exception("Access denied. Admins only.");
            }

            // Check if issue exists
            if (!IR.existsById(issueId)) {
                throw new Exception("Issue not found with ID: " + issueId);
            }
            
            Issues issue = IR.findById(issueId).get();
            
            // Check if issue is already closed
            if (issue.getStatus().equals("closed")) {
                throw new Exception("Issue is already closed");
            }
            
            String oldStatus = issue.getStatus();
            issue.setStatus("closed");
            IR.save(issue);

            // Record history in MongoDB
            recordHistory(issueId, "CLOSED", oldStatus, "closed", issue.getAssignedTo(), admin.getFullname(), token);
            
            // Create notification for issue creator
            Users creator = UR.findById(issue.getCreatedBy()).get();
            createNotification(creator.getId(), "Issue Closed", 
                "Your issue \"" + issue.getTitle() + "\" has been closed by " + admin.getFullname(), 
                "ISSUE_CLOSED", issueId, admin.getFullname(), token);
            
            // If assigned to someone, notify them
            if (issue.getAssignedTo() != null) {
                createNotification(issue.getAssignedTo(), "Issue Closed", 
                    "Issue \"" + issue.getTitle() + "\" assigned to you has been closed", 
                    "ISSUE_CLOSED", issueId, admin.getFullname(), token);
            }

            response.put("code", 200);
            response.put("message", "Issue closed successfully");
            response.put("issueId", issueId);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // Get single issue by ID (any authenticated user)
    public Object getIssueById(Long issueId, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            JWT.validateJWT(token);
            
            // Check if issue exists
            if (!IR.existsById(issueId)) {
                throw new Exception("Issue not found with ID: " + issueId);
            }
            
            Issues issue = IR.findById(issueId).get();
            response.put("code", 200);
            response.put("issue", issue);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // Helper method to validate status transitions
    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Define valid transitions
        switch (currentStatus) {
            case "open":
                return newStatus.equals("assigned") || newStatus.equals("in-progress");
            case "assigned":
                return newStatus.equals("in-progress");
            case "in-progress":
                return newStatus.equals("resolved");
            case "resolved":
                return newStatus.equals("closed");
            case "closed":
                return false; // Cannot change closed issues
            default:
                return false;
        }
    }
    
    // Method to record history in MongoDB via Node.js
    private void recordHistory(Long issueId, String action, String oldStatus, String newStatus, Long assignedTo, String changedBy, String token) {
        try {
            Map<String, Object> historyData = new HashMap<>();
            historyData.put("issueId", issueId);
            historyData.put("action", action);
            historyData.put("oldStatus", oldStatus);
            historyData.put("newStatus", newStatus);
            historyData.put("assignedTo", assignedTo);
            historyData.put("changedBy", changedBy);
            
            // Get issue title for better history tracking
            if (IR.existsById(issueId)) {
                Issues issue = IR.findById(issueId).get();
                historyData.put("issueTitle", issue.getTitle());
            }
            
            String json = objectMapper.writeValueAsString(historyData);
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(NODE_URL + "/history/add"))
                .header("Content-Type", "application/json")
                .header("Token", token)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
            
            // Async call to not block the main thread
            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    System.out.println("History recorded: " + response.statusCode());
                })
                .exceptionally(e -> {
                    System.err.println("Failed to record history: " + e.getMessage());
                    return null;
                });
        } catch (Exception e) {
            System.err.println("Error preparing history data: " + e.getMessage());
        }
    }
    
    // Method to create notification in MongoDB via Node.js
    private void createNotification(Long userId, String title, String message, String type, Long issueId, String actorName, String token) {
        try {
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("userId", userId);
            notificationData.put("title", title);
            notificationData.put("message", message);
            notificationData.put("type", type);
            notificationData.put("relatedIssueId", issueId);
            notificationData.put("relatedIssueTitle", "");
            
            // Get issue title if issue exists
            if (issueId != null && IR.existsById(issueId)) {
                Issues issue = IR.findById(issueId).get();
                notificationData.put("relatedIssueTitle", issue.getTitle());
            }
            
            String json = objectMapper.writeValueAsString(notificationData);
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(NODE_URL + "/notification/create"))
                .header("Content-Type", "application/json")
                .header("Token", token)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
            
            // Async call to not block the main thread
            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    System.out.println("Notification created for user " + userId + ": " + response.statusCode());
                })
                .exceptionally(e -> {
                    System.err.println("Failed to create notification: " + e.getMessage());
                    return null;
                });
        } catch (Exception e) {
            System.err.println("Error preparing notification data: " + e.getMessage());
        }
    }
}