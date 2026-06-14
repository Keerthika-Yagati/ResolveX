package issue_tracker.controller;


import issue_tracker.services.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/issue")
@CrossOrigin("*")
public class IssueController {

    @Autowired
    IssueService IS;

    // USER creates an issue
    @PostMapping("/create")
    public Object createIssue(@RequestBody Map<String, Object> data,
                              @RequestHeader("Token") String token) {
        return IS.createIssue(data, token);
    }

    // USER sees their own issues
    @GetMapping("/myissues")
    public Object getMyIssues(@RequestHeader("Token") String token) {
        return IS.getMyIssues(token);
    }

    // MANAGER sees all issues
    @GetMapping("/allissues")
    public Object getAllIssues(@RequestHeader("Token") String token) {
        return IS.getAllIssues(token);
    }

    // MANAGER assigns issue to developer
    @PutMapping("/assign/{ID}")
    public Object assignIssue(@PathVariable("ID") Long issueId,
                              @RequestBody Map<String, Object> data,
                              @RequestHeader("Token") String token) {
        return IS.assignIssue(issueId, data, token);
    }

    // DEVELOPER sees their assigned issues
    @GetMapping("/assignedtome")
    public Object getMyAssignedIssues(@RequestHeader("Token") String token) {
        return IS.getMyAssignedIssues(token);
    }

    // DEVELOPER updates issue status
    @PutMapping("/updatestatus/{ID}")
    public Object updateStatus(@PathVariable("ID") Long issueId,
                               @RequestBody Map<String, Object> data,
                               @RequestHeader("Token") String token) {
        return IS.updateIssueStatus(issueId, data, token);
    }

    // MANAGER closes an issue
    @PutMapping("/close/{ID}")
    public Object closeIssue(@PathVariable("ID") Long issueId,
                             @RequestHeader("Token") String token) {
        return IS.closeIssue(issueId, token);
    }

    // Anyone logged in can view a single issue
    @GetMapping("/getissue/{ID}")
    public Object getIssueById(@PathVariable("ID") Long issueId,
                               @RequestHeader("Token") String token) {
        return IS.getIssueById(issueId, token);
    }
}