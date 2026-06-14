package issue_tracker.repository;


import issue_tracker.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    // Check if email already exists during signup
    @Query("select U.id from Users U where U.email = :email")
    Object checkByEmail(@Param("email") String email);

    // Validate login credentials, return role if valid
    @Query("select U.role from Users U where U.email = :email and U.password = :password")
    Object validateCredentials(@Param("email") String email, @Param("password") String password);

    // Get full user by email (used after JWT decode)
    @Query("select U from Users U where U.email = :email")
    Object findByEmail(@Param("email") String email);

    // Get menus based on role (for sidebar navigation)
    @Query("select M from Menus M join Rolesmapping R on M.mid = R.mid where R.role = :role")
    List<Object> getMenus(@Param("role") Long role);

    // Get profile with role name joined
    @Query("select U, R from Users U left join Roles R on U.role = R.role where U.email = :email")
    Object profileByEmail(@Param("email") String email);

    // Get all developers (role = 2) — Manager uses this to assign issues
    @Query("select U from Users U where U.role = 2 and U.status = 1")
    List<Users> getAllDevelopers();
}