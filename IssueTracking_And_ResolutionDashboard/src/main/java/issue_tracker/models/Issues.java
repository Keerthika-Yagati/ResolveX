package issue_tracker.models;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table
public class Issues {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String title;           // Short title of the issue
    String description;     // Full description

    String priority;        // "low", "medium", "high"
    
    // Status flow: open → assigned → in-progress → resolved → closed
    String status;

    Long createdBy;         // userId of the User who created the issue
    Long assignedTo;        // userId of the Developer assigned by Manager

    LocalDateTime createdDate;
    LocalDateTime updatedDate;

    @PrePersist   // Auto-set createdDate before saving for the first time
    public void onCreate() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "open";  // Default status when issue is created
    }

    @PreUpdate    // Auto-update updatedDate on every update
    public void onUpdate() {
        this.updatedDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
}