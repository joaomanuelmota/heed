"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleOAuthCallback() {
      const { data, error } = await supabase.auth.getSessionFromUrl();

      if (error) {
        console.error("Erro no callback OAuth:", error.message);
        router.replace("/login");
        return;
      }

      // Sessão armazenada com sucesso
      router.replace("/dashboard");
    }

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">A autenticar...</h1>
      <p>Por favor aguarda um momento.</p>
    </div>
  );
}
