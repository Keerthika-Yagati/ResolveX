package issue_tracker.models;

import jakarta.persistence.*;

@Entity
@Table
public class Users {
    // Role constants
    public static final int ROLE_USER = 1;
    public static final int ROLE_DEVELOPER = 2;
    public static final int ROLE_ADMIN = 3;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String fullname;
    String phone;
    @Column(unique = true)
    String email;
    String password;
    int role;    // 1=User, 2=Developer, 3=Admin
    int status;  // 1=Active, 0=Inactive

    // Getters and setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullname() { return fullname; }
    public void setFullname(String fullname) { this.fullname = fullname; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public int getRole() { return role; }
    public void setRole(int role) { this.role = role; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
}