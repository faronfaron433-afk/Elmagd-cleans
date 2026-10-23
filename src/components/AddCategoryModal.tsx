import React, { useState } from 'react';
import { X, FolderPlus, Check, Sparkles, Droplets, ShieldCheck, Wind, Layers, Smile, Package } from 'lucide-react';
import { Category } from '../types/catalog';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSaveCategory: (name: string, iconName: string, description?: string) => Promise<any>;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSaveCategory,
}) => {
  const [name, setName] = useState(categoryToEdit ? categoryToEdit.name : '');
  const [iconName, setIconName] = useState(categoryToEdit ? categoryToEdit.iconName : 'Sparkles');
  const [description, setDescription] = useState(categoryToEdit?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const icons = [
    { id: 'Sparkles', label: 'مساحيق', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'Droplets', label: 'سوائل وجلي', icon: <Droplets className="w-4 h-4" /> },
    { id: 'ShieldCheck', label: 'مطهرات وكلور', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'Wind', label: 'معطرات', icon: <Wind className="w-4 h-4" /> },
    { id: 'Layers', label: 'مناديل وأدوات', icon: <Layers className="w-4 h-4" /> },
    { id: 'Smile', label: 'عناية وصابون', icon: <Smile className="w-4 h-4" /> },
    { id: 'Package', label: 'عام', icon: <Package className="w-4 h-4" /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSaveCategory(name.trim(), iconName, description.trim() || undefined);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">
              {categoryToEdit ? 'تعديل قسم' : 'إضافة قسم جديد للمحل'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم القسم *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: مساحيق غسيل، صابون مواعين، معطرات جو..."
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الأيقونة والرمز:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {icons.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIconName(item.id)}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    iconName === item.id
                      ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              وصف مختصر للقسم (اختياري)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: مساحيق عادية وأوتوماتيك وجل"
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ القسم'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
