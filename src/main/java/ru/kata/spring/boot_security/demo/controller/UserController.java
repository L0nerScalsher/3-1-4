package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;

@Controller
@RequestMapping("/user")
public class UserController {

    private final RoleService roleService;

    public UserController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public String userPage(@AuthenticationPrincipal User user, Model model) {
        model.addAttribute("user", user);
        model.addAttribute("allRoles", roleService.getAllRoles());
        return "user";
    }
}