package issue_tracker.services;

import issue_tracker.models.Users;
import issue_tracker.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UsersService {

    @Autowired
    UsersRepository UR;

    @Autowired
    JwtService JWT;

    // ───────────── SIGNUP ─────────────
    public Object signup(Users U) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object id = UR.checkByEmail(U.getEmail());
            if (id != null) {
                response.put("code", 501);
                response.put("message", "Email already registered");
            } else {
                // Use the role sent from frontend, default to 1 if not provided
                if (U.getRole() == 0) U.setRole(1);
                U.setStatus(1);
                UR.save(U);
                response.put("code", 200);
                response.put("message", "Account created successfully");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ───────────── SIGNIN ─────────────
    public Object signin(Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object role = UR.validateCredentials(
                data.get("email").toString(),
                data.get("password").toString()
            );
            if (role != null) {
                response.put("code", 200);
                response.put("jwt", JWT.generateJWT(data.get("email"), role));
            } else {
                response.put("code", 404);
                response.put("message", "Invalid credentials");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ───────────── USER INFO + MENUS ─────────────
    public Object uinfo(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Users U = (Users) UR.findByEmail(email);
            List<Object> menuList = UR.getMenus(Long.valueOf(U.getRole()));

            response.put("code", 200);
            response.put("fullname", U.getFullname());
            response.put("role", U.getRole());
            response.put("userId", U.getId());
            response.put("menulist", menuList);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ───────────── PROFILE ─────────────
    public Object getProfile(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = payload.get("username").toString();
            Object user = UR.profileByEmail(email);
            response.put("code", 200);
            response.put("user", user);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ───────────── GET ALL USERS (paginated) ─────────────
    public Object getAllUsers(int page, int size, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            JWT.validateJWT(token);
            Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").ascending());
            Page<Users> users = UR.findAll(pageable);
            response.put("code", 200);
            response.put("totalpages", users.getTotalPages());
            response.put("users", users.getContent());
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ───────────── GET ALL DEVELOPERS (for Manager dropdown) ─────────────
    public Object getAllDevelopers(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            JWT.validateJWT(token);
            List<Users> devs = UR.getAllDevelopers();
            response.put("code", 200);
            response.put("developers", devs);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ───────────── UPDATE USER ─────────────
    public Object updateUser(Long id, Users U, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            JWT.validateJWT(token);
            Users temp = UR.findById(id).get();
            temp.setFullname(U.getFullname());
            temp.setPhone(U.getPhone());
            temp.setPassword(U.getPassword());
            UR.save(temp);
            response.put("code", 200);
            response.put("message", "User updated successfully");
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ───────────── DELETE USER ─────────────
    public Object deleteUser(Long id, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            JWT.validateJWT(token);
            UR.deleteById(id);
            response.put("code", 200);
            response.put("message", "User deleted successfully");
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }
}