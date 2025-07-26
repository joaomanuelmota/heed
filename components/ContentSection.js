'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Button from './Button'
import RichTextEditor from './RichTextEditor'
import { formatDate } from '../lib/dateUtils'

const ContentSection = ({ 
  type, // 'notes' ou 'treatment_plans'
  title, // 'Notas Clínicas' ou 'Plano Terapêutico'
  icon: Icon,
  patientId,
  userId,
  placeholder = "Escreva aqui o conteúdo...",
  buttonText = "Adicionar",
  validationMessage = "Escreve um título."
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [triedSave, setTriedSave] = useState(false)
  const [triedSaveEdit, setTriedSaveEdit] = useState(false)
  
  // Configuração dinâmica baseada no tipo
  const config = {
    notes: {
      table: 'notes',
      dateField: 'note_date',
      titleField: 'title',
      contentField: 'content'
    },
    treatment_plans: {
      table: 'treatment_plans',
      dateField: 'plan_date',
      titleField: 'title',
      contentField: 'content'
    }
  }[type]

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    [config.dateField]: new Date().toISOString().split('T')[0]
  })

  const [editData, setEditData] = useState({
    title: '',
    content: '',
    [config.dateField]: ''
  })

  const queryClient = useQueryClient()

  // React Query - Buscar dados
  const {
    data: items = [],
    isLoading: loadingItems
  } = useQuery({
    queryKey: [type, userId, patientId],
    queryFn: async () => {
      if (!userId || !patientId) return [];
      const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', userId)
        .order(config.dateField, { ascending: false })

      if (error) {
        console.error(`Error fetching ${type}:`, error)
        return []
      }
      return data || []
    },
    enabled: !!userId && !!patientId
  })

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (data) => {
      const newItem = {
        psychologist_id: userId,
        patient_id: patientId,
        [config.titleField]: data.title.trim(),
        [config.contentField]: data.content || '',
        [config.dateField]: data[config.dateField],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: result, error } = await supabase
        .from(config.table)
        .insert([newItem])
        .select()

      if (error) throw new Error(error.message)
      return result[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type, userId, patientId] })
      setFormData({
        title: '',
        content: '',
        [config.dateField]: new Date().toISOString().split('T')[0]
      })
      setShowAddForm(false)
      setTriedSave(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, updateData }) => {
      const { data, error } = await supabase
        .from(config.table)
        .update(updateData)
        .eq('id', itemId)
        .eq('psychologist_id', userId)
        .select()

      if (error) throw new Error(error.message)
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type, userId, patientId] })
      setEditingId(null)
      setEditData({ title: '', content: '', [config.dateField]: '' })
      setTriedSaveEdit(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq('id', itemId)
        .eq('psychologist_id', userId)

      if (error) throw new Error(error.message)
      return itemId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type, userId, patientId] })
    }
  })

  // Funções auxiliares
  const validarTitulo = (titulo) => {
    return titulo && titulo.trim().length > 0
  }

  const saveItem = async () => {
    if (!formData.title.trim()) {
      setTriedSave(true)
      return
    }

    try {
      await addMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao salvar')
    }
  }

  const saveEditItem = async (itemId) => {
    if (!editData.title.trim()) {
      setTriedSaveEdit(true)
      return
    }

    try {
      const updateData = {
        [config.titleField]: editData.title.trim(),
        [config.contentField]: editData.content || '',
        [config.dateField]: editData[config.dateField],
        updated_at: new Date().toISOString()
      }

      await updateMutation.mutateAsync({ itemId, updateData })
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao atualizar')
    }
  }

  const deleteItem = async (itemId) => {
    if (!confirm('Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await deleteMutation.mutateAsync(itemId)
      alert('Item excluído com sucesso!')
    } catch (error) {
      console.error('Erro inesperado:', error)
      alert('Erro inesperado ao excluir')
    }
  }

  const startEditItem = (item) => {
    setEditingId(item.id)
    setEditData({
      title: item[config.titleField],
      content: item[config.contentField] || '',
      [config.dateField]: item[config.dateField]
    })
  }

  const cancelEditItem = () => {
    setEditingId(null)
    setEditData({ title: '', content: '', [config.dateField]: '' })
    setTriedSaveEdit(false)
  }

  return (
    <div className="space-y-6">
      {/* Header com botão */}
      <div className="flex justify-end items-center">
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2"
          variant={showAddForm ? 'secondary' : 'primary'}
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancelar' : `${buttonText} ${title}`}</span>
        </Button>
      </div>

      {/* Formulário de criação */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="item-title" className="block text-sm font-medium text-gray-700">Título</label>
              <input
                id="item-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Título *"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="item-date" className="block text-sm font-medium text-gray-700">Data</label>
              <input
                id="item-date"
                type="date"
                value={formData[config.dateField]}
                onChange={(e) => setFormData({...formData, [config.dateField]: e.target.value})}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({...formData, content})}
              placeholder={placeholder}
            />
          </div>
          <div className="flex flex-col gap-2">
            {!validarTitulo(formData.title) && triedSave && (
              <p className="text-red-500 text-sm text-center">{validationMessage}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => { setShowAddForm(false); setTriedSave(false); }}
                variant="secondary"
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => saveItem()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de itens */}
      <div className="space-y-6">
        {loadingItems ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">A carregar...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-gray-500 text-center py-12">Adiciona um {title.toLowerCase()}</div>
        ) : (
          items.map((item) => {
            const isExpanded = expandedId === item.id;
            const isEditing = editingId === item.id;
            
            return (
              <div key={item.id}>
                {/* Item Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  {/* Header with title and date */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-gray-900">{item[config.titleField]}</h4>
                                         <span className="text-sm text-gray-500 font-medium">
                       {formatDate(item[config.dateField], { day: '2-digit', month: '2-digit', year: 'numeric' })}
                     </span>
                  </div>
                  
                  {/* Content */}
                  {isExpanded ? (
                    isEditing ? (
                      // Formulário de edição inline
                      <form onSubmit={e => { e.preventDefault(); saveEditItem(item.id); }} className="space-y-3">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <div className="flex-1">
                            <label htmlFor="edit-item-title" className="block text-sm font-medium text-gray-700">Título</label>
                            <input
                              id="edit-item-title"
                              type="text"
                              value={editData.title}
                              onChange={e => setEditData({ ...editData, title: e.target.value })}
                              placeholder="Título *"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
                              required
                            />
                          </div>
                          <div className="flex flex-col">
                            <label htmlFor="edit-item-date" className="block text-sm font-medium text-gray-700">Data</label>
                            <input
                              id="edit-item-date"
                              type="date"
                              value={editData[config.dateField]}
                              onChange={e => setEditData({ ...editData, [config.dateField]: e.target.value })}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <RichTextEditor
                          value={editData.content}
                          onChange={(content) => setEditData({ ...editData, content })}
                          placeholder={placeholder}
                        />
                        <div className="flex flex-col gap-2">
                          {!validarTitulo(editData.title) && triedSaveEdit && (
                            <p className="text-red-500 text-sm text-center">{validationMessage}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <Button
                              onClick={cancelEditItem}
                              variant="secondary"
                              className="text-xs"
                            >
                              Cancelar
                            </Button>
                            <div className="flex gap-2">
                              <Button type="submit" className="px-3 py-1 text-sm font-medium">Salvar</Button>
                            </div>
                          </div>
                        </div>
                      </form>
                    ) : (
                      // Visualização expandida
                      <>
                        <div className="prose prose-sm max-w-none text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: item[config.contentField] }} />
                        <div className="flex items-center justify-between mt-2">
                          <button onClick={() => setExpandedId(null)} className="text-blue-600 hover:underline text-xs bg-transparent border-none p-0 m-0">Ver menos</button>
                          <div className="flex gap-2">
                            <button onClick={() => { setExpandedId(item.id); startEditItem(item); }} className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </>
                    )
                  ) : (
                    // Visualização compacta
                    <>
                      <div className="text-gray-700 text-sm mb-2" style={{ maxHeight: '3.6em', overflow: 'hidden' }}>
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item[config.contentField] }} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <button onClick={() => setExpandedId(item.id)} className="text-blue-600 hover:underline text-xs bg-transparent border-none p-0 m-0">Ver mais</button>
                        <div className="flex gap-2">
                          <button onClick={() => { setExpandedId(item.id); startEditItem(item); }} className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ContentSection 