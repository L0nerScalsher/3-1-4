package ru.kata.spring.boot_security.demo.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserService;


@Controller
public class UsersController {

	private final UserService userService;

	@Autowired
	public UsersController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/")
	public String printAllUsers(Model model) {
		model.addAttribute("users", userService.getUsers());
		return "users";
	}

	@GetMapping("/addUser")
	public String addUserForm(Model model) {
		return "addUser";
	}

	@PostMapping("/addUser")
	public String addUser(@RequestParam String firstName, @RequestParam String lastName,
						  @RequestParam String email) {
		User user = new User(firstName, lastName, email);
		userService.addUser(user);
		return "redirect:/";
	}

	@GetMapping("/editUser")
	public String editUser(@RequestParam Long id, Model model) {
		User user = userService.getUserById(id);
		model.addAttribute("user", user);
		return "editUser";
	}

	@PostMapping("/updateUser")
	public String updateUser(@RequestParam Long id, @RequestParam String firstName,
							 @RequestParam String lastName, @RequestParam String email) {
		User user = userService.getUserById(id);
		if (user != null) {
			user.setFirstName(firstName);
			user.setLastName(lastName);
			user.setEmail(email);
			userService.addUser(user);
		}
		return "redirect:/";
	}
	@PostMapping("/deleteUser")
	public String deleteUser(@RequestParam Long id) {
		userService.deleteUser(id);
		return "redirect:/";
	}

}