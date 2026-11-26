import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1 className="not-found-code">404</h1>
      <h2 className="not-found-title">Страница не найдена или доступ запрещен</h2>
      <p className="not-found-description">
        У вас нет прав для просмотра этого счета, либо он был удален.
      </p>
      <button 
        className="not-found-button"
        onClick={() => navigate("/my", { replace: true })}
      >
        Вернуться к моим счетам
      </button>
    </div>
  );
}