import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CogniTime — Assistente de Estudos" },
      { name: "description", content: "Pomodoro, revisão espaçada e simulados inteligentes para estudar melhor." },
      { property: "og:title", content: "CogniTime" },
      { property: "og:description", content: "Seu assistente de estudos inteligente." },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/app/index.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#5eead4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      Carregando CogniTime…
    </div>
  );
}
