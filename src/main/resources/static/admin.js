document.addEventListener("DOMContentLoaded", function () {
    // Получаем CSRF токен
    const csrfToken = document.querySelector("meta[name='_csrf']").content;
    const csrfHeader = document.querySelector("meta[name='_csrf_header']").content;

    // Добавляем CSRF токен в заголовки всех fetch запросов
    const fetchWithCsrf = (url, options = {}) => {
        const headers = options.headers || {};
        headers[csrfHeader] = csrfToken;
        headers['Content-Type'] = 'application/json';
        options.headers = headers;
        return fetch(url, options);
    };

    // Загрузка данных
    fetchCurrentUser();
    fetchRoles();
    fetchUsers();

    // Обработчик добавления пользователя
    document.getElementById("newUserForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const selectedRoles = Array.from(document.getElementById("RoleAdd").selectedOptions)
            .map(option => ({ id: parseInt(option.value) }));

        const formData = {
            firstName: document.getElementById("firstNameAdd").value,
            lastName: document.getElementById("lastNameAdd").value,
            age: parseInt(document.getElementById("ageAdd").value),
            email: document.getElementById("emailAdd").value,
            password: document.getElementById("passwordAdd").value,
            roles: selectedRoles
        };

        fetchWithCsrf("/api/users", {
            method: "POST",
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(() => {
                fetchUsers();
                this.reset();
                document.querySelector('#home-tab').click();
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error adding user: " + (error.message || "Unknown error"));
            });
    });

    // Обработчик редактирования пользователя
    document.getElementById("editUserForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const selectedRoles = Array.from(document.getElementById("RoleEdit").selectedOptions)
            .map(option => ({ id: parseInt(option.value) }));

        const formData = {
            id: parseInt(document.getElementById("idEdit").value),
            firstName: document.getElementById("firstNameEdit").value,
            lastName: document.getElementById("lastNameEdit").value,
            age: parseInt(document.getElementById("ageEdit").value),
            email: document.getElementById("emailEdit").value,
            password: document.getElementById("passwordEdit").value,
            roles: selectedRoles
        };

        fetchWithCsrf("/api/users", {
            method: "PUT",
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(() => {
                $('#editModal').modal('hide');
                fetchUsers();
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error updating user: " + (error.message || "Unknown error"));
            });
    });

    // Обработчик удаления пользователя
    document.querySelector("#deleteModal form").addEventListener("submit", function(e) {
        e.preventDefault();
        const userId = document.getElementById("id").value;

        fetchWithCsrf(`/api/users/${userId}`, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    $('#deleteModal').modal('hide');
                    fetchUsers();
                } else {
                    alert("Error deleting user");
                }
            });
    });

    // Делегирование событий для кнопок в таблице
    document.getElementById("usersTableBody").addEventListener("click", function(e) {
        if (e.target.classList.contains("edit-btn")) {
            const userId = e.target.dataset.id;
            fetch(`/api/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    document.getElementById("idEdit").value = user.id;
                    document.getElementById("firstNameEdit").value = user.firstName;
                    document.getElementById("lastNameEdit").value = user.lastName;
                    document.getElementById("ageEdit").value = user.age;
                    document.getElementById("emailEdit").value = user.email;
                    document.getElementById("passwordEdit").value = "";

                    // Установка выбранных ролей
                    const roleSelect = document.getElementById("RoleEdit");
                    Array.from(roleSelect.options).forEach(option => {
                        option.selected = user.roles.some(role => role.id.toString() === option.value);
                    });

                    $('#editModal').modal('show');
                });
        }

        if (e.target.classList.contains("delete-btn")) {
            const userId = e.target.dataset.id;
            fetch(`/api/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    document.getElementById("id").value = user.id;
                    document.getElementById("firstName").value = user.firstName;
                    document.getElementById("lastName").value = user.lastName;
                    document.getElementById("age").value = user.age;
                    document.getElementById("email").value = user.email;

                    // Заполнение ролей (только для отображения)
                    const rolesSelect = document.getElementById("exampleFormControlSelect2");
                    rolesSelect.innerHTML = user.roles.map(role =>
                        `<option>${role.roleName.replace("ROLE_", "")}</option>`
                    ).join('');

                    $('#deleteModal').modal('show');
                });
        }
    });

    // Вспомогательные функции
    function fetchCurrentUser() {
        fetch("/api/current-user")
            .then(response => response.json())
            .then(user => {
                document.getElementById("currentUserEmail").textContent = user.email;
                document.getElementById("currentUserRoles").textContent =
                    user.roles.map(role => role.roleName.replace("ROLE_", "")).join(" ");
            });
    }

    function fetchRoles() {
        fetch("/api/roles")
            .then(response => response.json())
            .then(roles => {
                const roleSelectAdd = document.getElementById("RoleAdd");
                const roleSelectEdit = document.getElementById("RoleEdit");

                roleSelectAdd.innerHTML = roles.map(role =>
                    `<option value="${role.id}">${role.roleName.replace("ROLE_", "")}</option>`
                ).join('');

                roleSelectEdit.innerHTML = roleSelectAdd.innerHTML;
            });
    }

    function fetchUsers() {
        fetch("/api/users")
            .then(response => response.json())
            .then(users => {
                const tbody = document.getElementById("usersTableBody");
                tbody.innerHTML = users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.firstName}</td>
                        <td>${user.lastName}</td>
                        <td>${user.age}</td>
                        <td>${user.email}</td>
                        <td>${user.roles.map(role => role.roleName.replace("ROLE_", "")).join(" ")}</td>
                        <td><button class="btn btn-primary btn-sm edit-btn" data-id="${user.id}">Edit</button></td>
                        <td><button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">Delete</button></td>
                    </tr>
                `).join('');
            });
    }
});