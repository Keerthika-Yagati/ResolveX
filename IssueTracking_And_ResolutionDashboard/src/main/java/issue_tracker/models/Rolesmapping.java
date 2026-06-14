package issue_tracker.models;


import jakarta.persistence.*;

@Entity
@Table
@IdClass(RolesmappingId.class)  // Composite key class
public class Rolesmapping {
    @Id
    Long mid;
    @Id
    Long role;

    public Long getMid() { return mid; }
    public void setMid(Long mid) { this.mid = mid; }
    public Long getRole() { return role; }
    public void setRole(Long role) { this.role = role; }
}
