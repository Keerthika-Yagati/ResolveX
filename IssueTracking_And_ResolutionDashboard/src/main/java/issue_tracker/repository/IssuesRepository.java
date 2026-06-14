package issue_tracker.repository;


import issue_tracker.models.Issues;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IssuesRepository extends JpaRepository<Issues, Long> {

    // User: get all issues created by a specific user
    @Query("select I from Issues I where I.createdBy = :userId order by I.createdDate desc")
    List<Issues> getIssuesByUser(@Param("userId") Long userId);

    // Developer: get all issues assigned to them
    @Query("select I from Issues I where I.assignedTo = :devId order by I.createdDate desc")
    List<Issues> getIssuesByDeveloper(@Param("devId") Long devId);

    // Manager: get issues filtered by status
    @Query("select I from Issues I where I.status = :status order by I.createdDate desc")
    List<Issues> getIssuesByStatus(@Param("status") String status);

    // Manager: get all issues with user and developer info
    @Query("select I from Issues I order by I.createdDate desc")
    List<Issues> getAllIssues();
}
