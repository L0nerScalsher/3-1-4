package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.Set;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping
    public String adminPage(@AuthenticationPrincipal User admin, Model model) {
        model.addAttribute("admin", admin);
        model.addAttribute("users", userService.getUsers());
        model.addAttribute("allRoles", roleService.getAllRoles());
        return "admin";
    }


    @PostMapping("/add")
    public String addUser(@ModelAttribute User user, @RequestParam("roleIds") Set<Long> roleIds) {
        Set<Role> roles = roleService.findRolesByIds(roleIds);
        user.setRoles(roles);
        userService.addUser(user);
        return "redirect:/admin";
    }


    @PostMapping("/edit")
    public String editUser(
            @RequestParam Long id,
            @RequestParam Integer age,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String email,
            @RequestParam(value = "roleIds", required = false) Set<Long> roleIds,
            @RequestParam(value = "newPassword", required = false) String newPassword
    ) {
        User userDB = userService.getUserById(id);

        userDB.setAge(age);
        userDB.setFirstName(firstName);
        userDB.setLastName(lastName);
        userDB.setEmail(email);
        userService.editUser(userDB, newPassword, roleIds);
        return "redirect:/admin";
    }

    @PostMapping("/delete")
    public String deleteUser(@RequestParam Long id) {
        userService.deleteUser(id);
        return "redirect:/admin";
    }

    @GetMapping("/user")
    public String userPage(@AuthenticationPrincipal User user, Model model) {
        model.addAttribute("user", user);
        model.addAttribute("allRoles", roleService.getAllRoles());
        return "admin-user";
    }
}