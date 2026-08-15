/**
 * AdminContentTab.jsx
 * -----------------------------------------
 * Content management per approved UX spec (B.23): sub-tabs for Skills,
 * Career Paths, Courses, Platforms, each a real CRUD table, plus
 * bulk-import for courses. Given the scope, each resource gets a
 * simple activate/deactivate + inline view — full create/edit forms
 * for the most complex resources (Courses/Career Paths with nested
 * requiredSkills) are kept intentionally lightweight here (deactivate
 * + bulk import covers the primary admin workflow), while Skills and
 * Platforms get full create/edit modals since their shape is simple.
 */

import { useEffect, useState, useRef } from 'react';
import { Plus, UploadCloud, Trash2, Pencil } from 'lucide-react';
import Button from '../../../components/ui/atoms/Button';
import Badge from '../../../components/ui/atoms/Badge';
import DataTable from '../../../components/ui/organisms/DataTable';
import Modal from '../../../components/ui/molecules/Modal';
import Input from '../../../components/ui/atoms/Input';
import { classNames } from '../../../utils';
import { adminApi } from '../admin.api';
import { useToast } from '../../../components/feedback/Toast';

const SUB_TABS = ['skills', 'careerPaths', 'courses', 'platforms'];

const SKILL_CATEGORIES = [
  'programming', 'dataScience', 'design', 'softSkill', 'tool', 'domainKnowledge', 'marketing', 'business', 'other',
];
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const PRICING_MODELS = ['subscription', 'payPerCourse', 'freemium', 'free'];

export default function AdminContentTab() {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState('skills');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadItems();
  }, [subTab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadItems() {
    setLoading(true);
    try {
      let data;
      if (subTab === 'skills') data = (await adminApi.listSkills({ limit: 100 })).data.skills;
      else if (subTab === 'careerPaths') data = (await adminApi.listCareerPaths({ limit: 100 })).data.careerPaths;
      else if (subTab === 'courses') data = (await adminApi.listCourses({ limit: 100 })).data.courses;
      else if (subTab === 'platforms') data = (await adminApi.listPlatforms({ limit: 100 })).data.platforms;
      setItems(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleDeactivate = async (item) => {
    if (!window.confirm(`Deactivate "${item.title || item.skillName || item.name}"?`)) return;
    try {
      if (subTab === 'skills') await adminApi.deactivateSkill(item._id);
      else if (subTab === 'careerPaths') await adminApi.deactivateCareerPath(item._id);
      else if (subTab === 'courses') await adminApi.deactivateCourse(item._id);
      else if (subTab === 'platforms') await adminApi.deactivatePlatform(item._id);
      showToast('Deactivated successfully', 'success');
      loadItems();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBulkImport = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      const { data } = await adminApi.bulkImportCourses(file);
      showToast(
        `Imported ${data.importedCount}, skipped ${data.skippedCount}${data.errors.length ? `, ${data.errors.length} errors` : ''}`,
        data.errors.length > 0 ? 'info' : 'success'
      );
      if (subTab === 'courses') loadItems();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setImporting(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const columnsByTab = {
    skills: [
      { key: 'skillName', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'difficultyLevel', label: 'Difficulty' },
      { key: 'isActive', label: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
      {
        key: 'actions',
        label: '',
        render: (r) => (
          <div className="flex gap-1">
            <button onClick={() => openEditModal(r)} className="text-text-tertiary hover:text-brand">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => handleDeactivate(r)} className="text-text-tertiary hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    careerPaths: [
      { key: 'title', label: 'Title' },
      { key: 'industry', label: 'Industry' },
      { key: 'growthOutlook', label: 'Growth' },
      { key: 'isActive', label: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
      {
        key: 'actions',
        label: '',
        render: (r) => (
          <button onClick={() => handleDeactivate(r)} className="text-text-tertiary hover:text-danger">
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    courses: [
      { key: 'title', label: 'Title' },
      { key: 'platform', label: 'Platform', render: (r) => r.platformId?.name || '—' },
      { key: 'level', label: 'Level' },
      { key: 'isActive', label: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
      {
        key: 'actions',
        label: '',
        render: (r) => (
          <button onClick={() => handleDeactivate(r)} className="text-text-tertiary hover:text-danger">
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    platforms: [
      { key: 'name', label: 'Name' },
      { key: 'pricingModel', label: 'Pricing' },
      { key: 'averageRating', label: 'Rating', render: (r) => r.averageRating?.toFixed(1) || '—' },
      { key: 'isActive', label: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
      {
        key: 'actions',
        label: '',
        render: (r) => (
          <div className="flex gap-1">
            <button onClick={() => openEditModal(r)} className="text-text-tertiary hover:text-brand">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => handleDeactivate(r)} className="text-text-tertiary hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {SUB_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={classNames(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize',
                subTab === tab ? 'bg-brand-subtle text-brand' : 'text-text-secondary hover:bg-surface-secondary'
              )}
            >
              {tab.replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {subTab === 'courses' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleBulkImport(e.target.files?.[0])}
              />
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} isLoading={importing}>
                <UploadCloud className="h-4 w-4" /> Bulk Import CSV
              </Button>
            </>
          )}
          {(subTab === 'skills' || subTab === 'platforms') && (
            <Button size="sm" onClick={openCreateModal}>
              <Plus className="h-4 w-4" /> New
            </Button>
          )}
        </div>
      </div>

      <DataTable columns={columnsByTab[subTab]} rows={items} loading={loading} />

      {modalOpen && subTab === 'skills' && (
        <SkillFormModal
          skill={editingItem}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadItems();
          }}
        />
      )}
      {modalOpen && subTab === 'platforms' && (
        <PlatformFormModal
          platform={editingItem}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadItems();
          }}
        />
      )}
    </div>
  );
}

function SkillFormModal({ skill, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    skillName: skill?.skillName || '',
    category: skill?.category || SKILL_CATEGORIES[0],
    difficultyLevel: skill?.difficultyLevel || DIFFICULTY_LEVELS[0],
    description: skill?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (skill) await adminApi.updateSkill(skill._id, form);
      else await adminApi.createSkill(form);
      showToast('Skill saved successfully', 'success');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={skill ? 'Edit Skill' : 'New Skill'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Skill name"
          value={form.skillName}
          onChange={(e) => setForm((f) => ({ ...f, skillName: e.target.value }))}
        />
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm text-text-primary"
        >
          {SKILL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={form.difficultyLevel}
          onChange={(e) => setForm((f) => ({ ...f, difficultyLevel: e.target.value }))}
          className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm text-text-primary"
        >
          {DIFFICULTY_LEVELS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full rounded-md border border-border-strong bg-surface p-3 text-sm text-text-primary"
        />
      </div>
    </Modal>
  );
}

function PlatformFormModal({ platform, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: platform?.name || '',
    pricingModel: platform?.pricingModel || PRICING_MODELS[0],
    website: platform?.website || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (platform) await adminApi.updatePlatform(platform._id, form);
      else await adminApi.createPlatform(form);
      showToast('Platform saved successfully', 'success');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={platform ? 'Edit Platform' : 'New Platform'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Platform name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <select
          value={form.pricingModel}
          onChange={(e) => setForm((f) => ({ ...f, pricingModel: e.target.value }))}
          className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm text-text-primary"
        >
          {PRICING_MODELS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <Input
          placeholder="Website URL (optional)"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
        />
      </div>
    </Modal>
  );
}