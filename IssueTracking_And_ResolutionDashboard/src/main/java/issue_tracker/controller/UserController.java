package issue_tracker.controller;

import issue_tracker.models.Users;
import issue_tracker.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin("*")   // Allows FastAPI and frontend to call this
public class UserController {

    @Autowired
    UsersService US;

    @PostMapping("/signup")
    public Object signup(@RequestBody Users U) {
        return US.signup(U);
    }

    @PostMapping("/signin")
    public Object signin(@RequestBody Map<String, Object> data) {
        return US.signin(data);
    }

    @GetMapping("/uinfo")
    public Object uinfo(@RequestHeader("Token") String token) {
        return US.uinfo(token);
    }

    @GetMapping("/profile")
    public Object profile(@RequestHeader("Token") String token) {
        return US.getProfile(token);
    }

    @GetMapping("/getallusers/{PAGE}/{SIZE}")
    public Object getAllUsers(@PathVariable("PAGE") int page,
                              @PathVariable("SIZE") int size,
                              @RequestHeader("Token") String token) {
        return US.getAllUsers(page, size, token);
    }

    @GetMapping("/getalldevelopers")
    public Object getAllDevelopers(@RequestHeader("Token") String token) {
        return US.getAllDevelopers(token);
    }

    @PutMapping("/updateuser/{ID}")
    public Object updateUser(@PathVariable("ID") Long id,
                             @RequestBody Users U,
                             @RequestHeader("Token") String token) {
        return US.updateUser(id, U, token);
    }

    @DeleteMapping("/deleteuser/{ID}")
    public Object deleteUser(@PathVariable("ID") Long id,
                             @RequestHeader("Token") String token) {
        return US.deleteUser(id, token);
    }
}