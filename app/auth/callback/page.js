"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Erro na autenticação:', error?.message);
          router.replace('/login');
        } else {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        router.replace('/login');
      }
    }

    checkUser();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">A autenticar...</h1>
      <p>Por favor aguarda um momento.</p>
    </div>
  );
}
