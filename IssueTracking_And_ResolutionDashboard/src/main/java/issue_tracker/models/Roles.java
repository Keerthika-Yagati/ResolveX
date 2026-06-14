package issue_tracker.models;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Roles {
    @Id
    Long role;        // 1 = User, 2 = Manager, 3 = Developer
    String rolename;

    public Long getRole() { return role; }
    public void setRole(Long role) { this.role = role; }
    public String getRolename() { return rolename; }
    public void setRolename(String rolename) { this.rolename = rolename; }
}
