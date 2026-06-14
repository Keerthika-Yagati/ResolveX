package issue_tracker.models;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Menus {
    @Id
    Long mid;
    String icon;
    String menu;

    public Long getMid() { return mid; }
    public void setMid(Long mid) { this.mid = mid; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getMenu() { return menu; }
    public void setMenu(String menu) { this.menu = menu; }
}
