import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from './Button';

const CONSENT_TYPES = [
  {
    key: 'essential',
    label: 'Dados Essenciais',
    description: 'Necessário para funcionamento básico da aplicação',
    editable: false,
  },
  {
    key: 'health_data',
    label: 'Dados de Saúde de Pacientes',
    description: 'Permite armazenar e processar informações clínicas dos pacientes',
    editable: true,
  },
  {
    key: 'service_improvement',
    label: 'Melhorias do Serviço',
    description: 'Análise de utilização para otimizar a aplicação',
    editable: true,
  },
  {
    key: 'communications',
    label: 'Comunicações',
    description: 'Receber atualizações e novidades sobre o serviço',
    editable: true,
  },
];

export default function ConsentManager({ userId }) {
  const [consents, setConsents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) fetchConsents();
  }, [userId]);

  const fetchConsents = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      setError('Erro ao carregar consentimentos.');
      setConsents(null);
    } else {
      setConsents(data);
    }
    setLoading(false);
  };

  const handleToggle = async (type) => {
    let updated = consents;
    let consent = consents?.find((c) => c.consent_type === type);
    if (!consent) {
      // Se não existir, cria o consentimento
      consent = {
        user_id: userId,
        consent_type: type,
        granted: true,
        granted_at: new Date().toISOString(),
        consent_version: '1.0',
      };
      updated = [...(consents || []), consent];
      setConsents(updated);
      setMessage('');
      setError('');
      const { error } = await supabase.from('user_consents').insert([consent]);
      if (error) setError('Erro ao criar consentimento.');
      else setMessage('Consentimento criado!');
      return;
    }
    updated = consents.map((c) =>
      c.consent_type === type
        ? { ...c, granted: !c.granted, granted_at: !c.granted ? new Date().toISOString() : null }
        : c
    );
    setConsents(updated);
    setMessage('');
    setError('');
    // Save instantly
    consent = updated.find((c) => c.consent_type === type);
    if (consent && consent.consent_type !== 'essential') {
      const { error } = await supabase
        .from('user_consents')
        .update({
          granted: consent.granted,
          granted_at: consent.granted ? new Date().toISOString() : null,
        })
        .eq('user_id', userId)
        .eq('consent_type', consent.consent_type);
      if (error) setError('Erro ao guardar alterações.');
      else setMessage('Consentimento atualizado!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">A carregar consentimentos...</span>
      </div>
    );
  }

  return (
    <div className="">
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      {message && <div className="mb-3 text-green-600 text-sm">{message}</div>}
      <ul className="divide-y divide-gray-200">
        {(() => {
          const type = CONSENT_TYPES.find(t => t.key === 'communications');
          const consent = consents?.find((c) => c.consent_type === type.key) || {};
          return (
            <li key={type.key} className="flex items-center justify-between py-4">
              <div>
                <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                <div className="text-gray-500 text-sm">{type.description}</div>
                {consent.granted && consent.granted_at && (
                  <div className="text-gray-400 text-sm mt-1">Dado em: {new Date(consent.granted_at).toLocaleString('pt-PT')}</div>
                )}
              </div>
              <input
                type="checkbox"
                checked={!!consent.granted}
                disabled={!type.editable || loading}
                onChange={() => type.editable && handleToggle(type.key)}
                className="w-6 h-6 accent-blue-600 rounded cursor-pointer disabled:opacity-60 focus:ring-2 focus:ring-blue-400 transition-colors"
                aria-label={`Consentimento para ${type.label}`}
              />
            </li>
          );
        })()}
      </ul>
    </div>
  );
} 