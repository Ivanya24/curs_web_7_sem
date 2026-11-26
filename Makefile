# Переменные для путей
BACKEND_DIR = Money_API
FRONTEND_DIR = money-frontend

# Цвета для красивого вывода в терминал
GREEN = \033[0;32m
NC = \033[0m # Без цвета

.PHONY: help setup migrate backend frontend run-all clean

# Цель по умолчанию (выводит справку)
help:
	@echo "Доступные команды:"
	@echo "  make setup     - Установить все зависимости (.NET и npm)"
	@echo "  make migrate   - Применить миграции базы данных"
	@echo "  make backend   - Запустить .NET бэкенд"
	@echo "  make frontend  - Установить npm пакеты и запустить React фронтенд"
	@echo "  make clean     - Очистить папки bin, obj и node_modules"

# Первоначальная настройка проекта
setup:
	@echo "$(GREEN)==> Установка зависимостей бэкенда...$(NC)"
	cd $(BACKEND_DIR) && dotnet restore
	@echo "$(GREEN)==> Установка зависимостей фронтенда...$(NC)"
	cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)==> Настройка завершена!$(NC)"

# Накат миграций
migrate:
	@echo "$(GREEN)==> Применение миграций базы данных...$(NC)"
	cd $(BACKEND_DIR) && dotnet ef database update
	@echo "$(GREEN)==> Миграции успешно применены!$(NC)"

# Запуск только бэкенда
backend:
	@echo "$(GREEN)==> Запуск .NET Backend...$(NC)"
	cd $(BACKEND_DIR) && dotnet run

# Запуск только фронтенда
frontend:
	@echo "$(GREEN)==> Проверка/установка npm зависимостей...$(NC)"
	cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)==> Запуск React Frontend (Vite)...$(NC)"
	cd $(FRONTEND_DIR) && npm run dev

# Очистка временных файлов (полезно перед коммитом или при ошибках)
clean:
	@echo "$(GREEN)==> Очистка временных файлов...$(NC)"
	rm -rf $(BACKEND_DIR)/bin $(BACKEND_DIR)/obj
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist
	@echo "$(GREEN)==> Очистка завершена.$(NC)"
