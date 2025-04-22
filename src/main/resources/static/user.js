document.addEventListener("DOMContentLoaded", function () {
    // Получаем CSRF токен
    const token = document.querySelector('meta[name="_csrf"]').content;
    const header = document.querySelector('meta[name="_csrf_header"]').content;

    // Функция для выполнения запросов с CSRF
    const fetchWithCsrf = (url, options = {}) => {
        const headers = options.headers || {};
        headers[header] = token;
        headers['Content-Type'] = 'application/json';
        options.headers = headers;
        return fetch(url, options);
    };

    // Загрузка данных пользователя
    loadUserData();

    // Обработчик выхода
    document.getElementById("logoutForm")?.addEventListener("submit", function(e) {
        e.preventDefault();
        fetchWithCsrf("/logout", { method: "POST" })
            .then(() => window.location.href = "/login")
            .catch(err => console.error("Logout error:", err));
    });

    // Основная функция загрузки данных
    function loadUserData() {
        fetch("/api/user/info")
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                updateUserInfo(data.user);
                renderNavigation(data.isAdmin);
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error loading user data");
            });
    }

    // Обновление информации о пользователе
    function updateUserInfo(user) {
        document.getElementById("currentUserEmail").textContent = user.email;
        document.getElementById("currentUserRoles").textContent =
            user.roles.map(role => role.roleName.replace("ROLE_", "")).join(", ");

        const tbody = document.getElementById("usersTableBodyById");
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>${user.age}</td>
                    <td>${user.email}</td>
                    <td>${user.roles.map(role => role.roleName.replace("ROLE_", "")).join(", ")}</td>
                </tr>
            `;
        }
    }

    // Рендер навигационного меню
    function renderNavigation(isAdmin) {
        const navPanel = document.getElementById("navPanel");
        if (!navPanel) return;

        if (isAdmin) {
            navPanel.innerHTML = `
                <div id="navPanel">
                    <a class="btn btn-toolbar p-2 bg-white w-100 text-primary mt-2 mb-0" 
                       href="/admin">
                        Admin
                    </a>
                    <div class="btn btn-toolbar p-2 w-100 bg-primary text-white mb-0">
                        User
                    </div>
                </div>
            `;
        } else {
            navPanel.innerHTML = `
                <div id="navPanel">
                    <div class="btn btn-toolbar p-2 w-100 bg-primary text-white mt-2 mb-0">
                        User
                    </div>
                </div>
            `;
        }

        // Добавляем обработчики для кнопок
        document.querySelectorAll('#navPanel a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = this.getAttribute('href');
            });
        });
    }
});