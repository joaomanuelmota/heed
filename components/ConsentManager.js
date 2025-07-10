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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

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

  const handleToggle = (type) => {
    setConsents((prev) =>
      prev.map((c) =>
        c.consent_type === type
          ? { ...c, granted: !c.granted, granted_at: !c.granted ? new Date().toISOString() : null }
          : c
      )
    );
    setDirty(true);
    setMessage('');
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    let hasError = false;
    for (const consent of consents) {
      if (consent.consent_type === 'essential') continue;
      const { error } = await supabase
        .from('user_consents')
        .update({
          granted: consent.granted,
          granted_at: consent.granted ? new Date().toISOString() : null,
        })
        .eq('user_id', userId)
        .eq('consent_type', consent.consent_type);
      if (error) hasError = true;
    }
    if (hasError) {
      setError('Erro ao guardar alterações.');
    } else {
      setMessage('Consentimentos atualizados com sucesso!');
      setDirty(false);
      fetchConsents();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">A carregar consentimentos...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Gestão de Consentimentos</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      {message && <div className="mb-3 text-green-600">{message}</div>}
      <ul className="space-y-4">
        {CONSENT_TYPES.map((type) => {
          const consent = consents?.find((c) => c.consent_type === type.key) || {};
          return (
            <li key={type.key} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <div className="font-medium text-gray-800">{type.label}</div>
                <div className="text-gray-500 text-sm">{type.description}</div>
                {consent.granted && consent.granted_at && (
                  <div className="text-xs text-gray-400 mt-1">Dado em: {new Date(consent.granted_at).toLocaleString('pt-PT')}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!consent.granted}
                  disabled={!type.editable || saving}
                  onChange={() => type.editable && handleToggle(type.key)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer disabled:opacity-60"
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="min-w-[120px]"
        >
          {saving ? 'A guardar...' : 'Guardar Alterações'}
        </Button>
      </div>
    </div>
  );
} 