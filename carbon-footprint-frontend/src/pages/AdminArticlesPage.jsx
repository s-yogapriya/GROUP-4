import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import api from '../api/axios';

import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  RefreshCw,
  X,
  AlertCircle,
  Save,
  Upload,
  ImageIcon,
  ArrowLeft,
  Clock,
  User,
  CalendarDays,
  FileText,
} from 'lucide-react';

import { formatCreatedAt } from '../utils/dateTime';

import { getArticleImage } from '../constants/categoryImages';

import Pagination from '../components/Pagination';
import { paginate } from '../utils/clientPagination';

const EMPTY_FORM = {
  title: '',
  shortDescription: '',
  content: '',
  category: '',
  status: 'DRAFT',
  visibleToUsers: false,
};

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXT = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];

/*
 * Articles must contain meaningful detailed content.
 *
 * 1000 characters is used instead of an extremely high word
 * requirement so admins can write structured articles without
 * being blocked unnecessarily.
 */
const MIN_ARTICLE_CONTENT_LENGTH = 1000;

function statusBadge(status) {
  if (status === 'PUBLISHED') {
    return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
  }

  if (status === 'UNPUBLISHED') {
    return 'bg-slate-800 text-slate-400 border border-slate-700';
  }

  return 'bg-amber-950 text-amber-400 border border-amber-800';
}

function getWordCount(text = '') {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/*
 * Safe real-image component.
 */
function SafeImg({
  src,
  fallbackSrc,
  alt,
  className = '',
}) {
  const [currentSrc, setCurrentSrc] = useState(
    src || fallbackSrc || ''
  );

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc || '');
  }, [src, fallbackSrc]);

  if (!currentSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 ${className}`}
      >
        <BookOpen className="h-10 w-10 text-slate-600" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => {
        if (
          fallbackSrc &&
          currentSrc !== fallbackSrc
        ) {
          setCurrentSrc(fallbackSrc);
        } else {
          setCurrentSrc('');
        }
      }}
    />
  );
}

/*
 * Image picker used inside create/edit form.
 */
function ImagePicker({
  existingUrl,
  fallbackUrl,
  onFileChange,
  imageError,
  setImageError,
}) {
  const inputRef = useRef(null);

  const [localPreview, setLocalPreview] =
    useState(null);

  const [fileName, setFileName] = useState('');

  const validate = (file) => {
    if (!file) {
      return 'Please select an image.';
    }

    const ext = file.name
      .substring(
        file.name.lastIndexOf('.')
      )
      .toLowerCase();

    if (
      !ALLOWED_EXT.includes(ext) ||
      !ALLOWED_TYPES.includes(
        file.type.toLowerCase()
      )
    ) {
      return 'Only JPG, JPEG, PNG and WEBP images are allowed.';
    }

    if (file.size > MAX_BYTES) {
      return 'Image size must be less than 5 MB.';
    }

    return null;
  };

  const handleFile = (file) => {
    const err = validate(file);

    if (err) {
      setImageError(err);
      onFileChange(null);
      setLocalPreview(null);
      setFileName('');
      return;
    }

    setImageError(null);
    setFileName(file.name);

    const url = URL.createObjectURL(file);

    setLocalPreview(url);
    onFileChange(file);
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();

    const file =
      e.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const previewSrc =
    localPreview ||
    existingUrl ||
    fallbackUrl ||
    null;

  const hasExisting =
    !!existingUrl && !localPreview;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300">
        Cover Image{' '}
        <span className="font-normal text-slate-500">
          (JPG, PNG, WEBP · max 5 MB)
        </span>
      </label>

      <div
        className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-600 transition-colors hover:border-emerald-500/60"
        style={{ minHeight: '10rem' }}
        onClick={() =>
          inputRef.current?.click()
        }
        onDrop={onDrop}
        onDragOver={(e) =>
          e.preventDefault()
        }
      >
        {previewSrc ? (
          <>
            <SafeImg
              src={previewSrc}
              fallbackSrc={fallbackUrl}
              alt="Cover preview"
              className="h-40 w-full"
            />

            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 opacity-0 transition-opacity hover:opacity-100">
              <Upload className="h-5 w-5 text-white" />

              <span className="text-sm font-semibold text-white">
                {hasExisting
                  ? 'Replace Image'
                  : 'Change Image'}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <div className="rounded-full bg-slate-800 p-3">
              <ImageIcon className="h-6 w-6 text-slate-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-300">
                Click or drag to upload
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                JPG, PNG, WEBP up to 5 MB
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {fileName && (
            <span className="truncate text-xs text-emerald-400">
              ✓ {fileName}
            </span>
          )}

          {hasExisting &&
            !fileName && (
              <span className="truncate text-xs text-slate-500">
                Current image saved
              </span>
            )}

          {!existingUrl &&
            !localPreview &&
            fallbackUrl && (
              <span className="truncate text-xs text-slate-500">
                Category photograph will be used
              </span>
            )}
        </div>

        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:bg-slate-700"
        >
          <Upload className="h-3.5 w-3.5" />

          {previewSrc
            ? 'Choose Another'
            : 'Choose Image'}
        </button>
      </div>

      {imageError && (
        <p className="flex items-center gap-1 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3 shrink-0" />

          {imageError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="unpublished"
        onChange={onInputChange}
      />
    </div>
  );
}

export default function AdminArticlesPage() {
  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] =
    useState(5);

  const [articles, setArticles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('ALL');

  const [categoryFilter, setCategoryFilter] =
    useState('ALL');

  const [showForm, setShowForm] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [imageFile, setImageFile] =
    useState(null);

  const [imageError, setImageError] =
    useState(null);

  const [errors, setErrors] =
    useState({});

  const [saving, setSaving] =
    useState(false);

  const [preview, setPreview] =
    useState(null);

  /*
   * Detailed article reader.
   */
  const [selectedArticle, setSelectedArticle] =
    useState(null);

  const load = useCallback(() => {
    setLoading(true);

    api
      .get('/articles/admin/all')
      .then((response) => {
        setArticles(
          Array.isArray(response?.data)
            ? response.data
            : []
        );
      })
      .catch(() => {
        setArticles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    statusFilter,
    categoryFilter,
  ]);

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...EMPTY_FORM,
    });

    setImageFile(null);
    setImageError(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (article) => {
    setEditing(article);

    setForm({
      title: article?.title || '',
      shortDescription:
        article?.shortDescription || '',
      content: article?.content || '',
      category: article?.category || '',
      status:
        article?.status || 'DRAFT',
      visibleToUsers:
        !!article?.visibleToUsers,
    });

    setImageFile(null);
    setImageError(null);
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const validationErrors = {};

    if (!form.title.trim()) {
      validationErrors.title =
        'Title is required.';
    }

    if (!form.shortDescription.trim()) {
      validationErrors.shortDescription =
        'Short description is required.';
    }

    if (!form.category.trim()) {
      validationErrors.category =
        'Category is required.';
    }

    if (!form.content.trim()) {
      validationErrors.content =
        'Article content is required.';
    } else if (
      form.content.trim().length <
      MIN_ARTICLE_CONTENT_LENGTH
    ) {
      validationErrors.content =
        `Article content should contain at least ${MIN_ARTICLE_CONTENT_LENGTH} characters so that users receive a detailed article.`;
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors)
        .length === 0
    );
  };

  const save = async (event) => {
    event.preventDefault();

    if (!validate() || imageError) {
      return;
    }

    setSaving(true);

    try {
      const formData =
        new FormData();

      formData.append(
        'title',
        form.title.trim()
      );

      formData.append(
        'shortDescription',
        form.shortDescription.trim()
      );

      formData.append(
        'content',
        form.content.trim()
      );

      formData.append(
        'category',
        form.category.trim()
      );

      formData.append(
        'status',
        form.status
      );

      formData.append(
        'visibleToUsers',
        form.visibleToUsers
      );

      if (imageFile) {
        formData.append(
          'image',
          imageFile
        );
      }

      if (editing) {
        await api.put(
          `/articles/admin/${editing.id}`,
          formData
        );
      } else {
        await api.post(
          '/articles/admin',
          formData
        );
      }

      setShowForm(false);
      setEditing(null);
      setForm({
        ...EMPTY_FORM,
      });
      setImageFile(null);

      await load();
    } catch (error) {
      setErrors({
        general:
          error?.message ||
          'Failed to save article.',
      });
    } finally {
      setSaving(false);
    }
  };

  const publish = async (id) => {
    try {
      await api.put(
        `/articles/admin/${id}/publish`
      );

      await load();
    } catch (error) {
      window.alert(
        error?.message ||
          'Failed to publish article.'
      );
    }
  };

  const unpublish = async (id) => {
    try {
      await api.put(
        `/articles/admin/${id}/unpublish`
      );

      await load();
    } catch (error) {
      window.alert(
        error?.message ||
          'Failed to unpublish article.'
      );
    }
  };

  const remove = async (id) => {
    if (
      !window.confirm(
        'Delete this article?'
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/articles/admin/${id}`
      );

      await load();
    } catch (error) {
      window.alert(
        error?.message ||
          'Failed to delete article.'
      );
    }
  };

  const field = (
    key,
    label,
    type = 'text',
    required = false
  ) => (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-rose-400">
            *
          </span>
        )}
      </label>

      {type === 'textarea' ? (
        <textarea
          rows={10}
          value={form[key]}
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              [key]:
                event.target.value,
            }));

            setErrors((previous) => ({
              ...previous,
              [key]: undefined,
              general: undefined,
            }));
          }}
          className={`w-full resize-y rounded-lg border bg-slate-900 p-2.5 text-sm text-white focus:outline-none ${
            errors[key]
              ? 'border-rose-500'
              : 'border-slate-700 focus:border-emerald-500'
          }`}
          placeholder={
            key === 'content'
              ? 'Write a detailed article with introduction, explanation, real-world examples, environmental impact, practical recommendations and conclusion...'
              : ''
          }
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              [key]:
                event.target.value,
            }));

            setErrors((previous) => ({
              ...previous,
              [key]: undefined,
              general: undefined,
            }));
          }}
          className={`w-full rounded-lg border bg-slate-900 p-2.5 text-sm text-white focus:outline-none ${
            errors[key]
              ? 'border-rose-500'
              : 'border-slate-700 focus:border-emerald-500'
          }`}
        />
      )}

      {errors[key] && (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3" />

          {errors[key]}
        </p>
      )}
    </div>
  );

  const filteredArticles =
    articles.filter((article) => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      const matchesSearch =
        !query ||
        [
          article?.title,
          article?.category,
          article?.shortDescription,
          article?.author,
        ].some((value) =>
          String(value || '')
            .toLowerCase()
            .includes(query)
        );

      const matchesStatus =
        statusFilter === 'ALL' ||
        article?.status ===
          statusFilter;

      const matchesCategory =
        categoryFilter === 'ALL' ||
        article?.category ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

  const articleCategories = [
    ...new Set(
      articles
        .map(
          (article) =>
            article?.category
        )
        .filter(Boolean)
    ),
  ].sort();

  const safePage = Math.max(
    1,
    page
  );

  const paginatedArticles =
    paginate(
      filteredArticles,
      safePage,
      pageSize
    );

  /*
   * Open the complete article reader.
   */
  const openArticle = (article) => {
    setSelectedArticle(article);
  };

  /*
   * ==========================================================
   * DETAILED ARTICLE READER
   * ==========================================================
   */
  if (selectedArticle) {
    const articleImage =
      selectedArticle?.coverImage ||
      getArticleImage(
        selectedArticle
      );

    return (
      <main className="min-h-screen bg-slate-950 px-5 py-8">
        <div className="mx-auto max-w-5xl">
          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={() =>
              setSelectedArticle(null)
            }
            className="mb-6 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Article Dashboard
          </button>

          {/* ARTICLE */}
          <article className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* HERO */}
            <div className="relative h-[360px] w-full overflow-hidden md:h-[460px]">
              <SafeImg
                src={articleImage}
                fallbackSrc={getArticleImage(
                  selectedArticle
                )}
                alt={
                  selectedArticle?.title
                }
                className="h-full w-full"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-sm">
                  {selectedArticle?.category ||
                    'Sustainability'}
                </span>

                <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight text-white md:text-5xl">
                  {selectedArticle?.title}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
                  {
                    selectedArticle?.shortDescription
                  }
                </p>
              </div>
            </div>

            {/* META */}
            <div className="flex flex-wrap items-center gap-5 border-b border-slate-800 px-6 py-5 text-xs text-slate-400 md:px-10">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />

                {selectedArticle?.author ||
                  'EcoTrack Admin'}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-400" />

                {formatCreatedAt(
                  selectedArticle?.createdAt
                )}
              </span>

              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />

                {getWordCount(
                  selectedArticle?.content
                )}{' '}
                words
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusBadge(
                  selectedArticle?.status
                )}`}
              >
                {selectedArticle?.status}
              </span>
            </div>

            {/* CONTENT */}
            <div className="px-6 py-8 md:px-14 md:py-12">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8 border-l-4 border-emerald-500 pl-5">
                  <p className="text-base font-medium leading-8 text-slate-300">
                    {
                      selectedArticle?.shortDescription
                    }
                  </p>
                </div>

                <div className="whitespace-pre-wrap text-[15px] leading-8 text-slate-300 md:text-base">
                  {
                    selectedArticle?.content
                  }
                </div>

                {/* END OF ARTICLE */}
                <div className="mt-12 border-t border-slate-800 pt-8">
                  <div className="mb-6 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-400" />

                    <span className="text-sm font-semibold text-slate-400">
                      End of article
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedArticle(
                        null
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                  >
                    <ArrowLeft className="h-4 w-4" />

                    Back to Article Dashboard
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-7 px-5 py-8">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-emerald-400" />

            <h1 className="text-2xl font-extrabold text-white md:text-3xl">
              Article Dashboard
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Create, manage and publish detailed sustainability articles for users.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search title, category..."
              className="w-60 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />

            {[
              'ALL',
              'PUBLISHED',
              'DRAFT',
              'UNPUBLISHED',
            ].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setStatusFilter(
                    filter
                  )
                }
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  statusFilter === filter
                    ? 'bg-emerald-500 text-slate-950'
                    : 'border border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {filter}
              </button>
            ))}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
            >
              <option value="ALL">
                All Categories
              </option>

              {articleCategories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 hover:bg-slate-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-slate-300" />
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />

            New Article
          </button>
        </div>
      </div>

      {/* =====================================================
          VISUAL ARTICLE DASHBOARD
         ===================================================== */}
      {!loading &&
        articles.length > 0 && (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedArticles.map(
              (article) => {
                const image =
                  article?.coverImage ||
                  getArticleImage(
                    article
                  );

                return (
                  <article
                    key={`card-${article.id}`}
                    onClick={() =>
                      openArticle(
                        article
                      )
                    }
                    className="group relative min-h-[390px] cursor-pointer overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-emerald-950/30"
                  >
                    {/* REAL FULL BACKGROUND IMAGE */}
                    <SafeImg
                      src={image}
                      fallbackSrc={getArticleImage(
                        article
                      )}
                      alt={article?.title}
                      className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105"
                    />

                    {/* DARK OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/10" />

                    {/* TOP STATUS */}
                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                        {article?.category ||
                          'Sustainability'}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold backdrop-blur-md ${statusBadge(
                          article?.status
                        )}`}
                      >
                        {article?.status}
                      </span>
                    </div>

                    {/* CONTENT OVER IMAGE */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-xl font-black leading-tight text-white">
                        {article?.title}
                      </h2>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-200">
                        {
                          article?.shortDescription
                        }
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />

                          {article?.author ||
                            'EcoTrack Admin'}
                        </span>

                        <span>
                          {formatCreatedAt(
                            article?.createdAt
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-300">
                        <BookOpen className="h-4 w-4" />

                        Click to read full article
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}

      {/* =====================================================
          TABLE
         ===================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50">
        {loading ? (
          <p className="p-8 text-center text-slate-400">
            Loading…
          </p>
        ) : filteredArticles.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4">
                    Title
                  </th>

                  <th className="p-4">
                    Category
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Visible
                  </th>

                  <th className="p-4">
                    Author
                  </th>

                  <th className="p-4">
                    Created At
                  </th>

                  <th className="p-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {paginatedArticles.map(
                  (article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-slate-800/40"
                    >
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            openArticle(
                              article
                            )
                          }
                          className="text-left"
                        >
                          <p className="line-clamp-1 font-semibold text-white hover:text-emerald-300">
                            {article.title}
                          </p>

                          <p className="line-clamp-1 text-xs text-slate-500">
                            {
                              article.shortDescription
                            }
                          </p>
                        </button>
                      </td>

                      <td className="p-4 text-slate-300">
                        {article.category}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge(
                            article.status
                          )}`}
                        >
                          {article.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            article.visibleToUsers
                              ? 'border border-emerald-800 bg-emerald-950 text-emerald-400'
                              : 'border border-slate-700 bg-slate-800 text-slate-500'
                          }`}
                        >
                          {article.visibleToUsers
                            ? 'YES'
                            : 'NO'}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-slate-400">
                        {article.author}
                      </td>

                      <td className="whitespace-nowrap p-4 text-xs text-slate-400">
                        {formatCreatedAt(
                          article.createdAt
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              openArticle(
                                article
                              )
                            }
                            title="Read Article"
                            className="rounded-lg bg-slate-800 p-1.5 text-emerald-400 hover:bg-slate-700"
                          >
                            <BookOpen className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPreview(
                                article
                              )
                            }
                            title="Preview"
                            className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                article
                              )
                            }
                            title="Edit"
                            className="rounded-lg bg-slate-800 p-1.5 text-teal-400 hover:bg-slate-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {article.status !==
                          'PUBLISHED' ? (
                            <button
                              type="button"
                              onClick={() =>
                                publish(
                                  article.id
                                )
                              }
                              title="Publish"
                              className="rounded-lg bg-emerald-950/60 p-1.5 text-emerald-400 hover:bg-emerald-900/60"
                            >
                              <Globe className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                unpublish(
                                  article.id
                                )
                              }
                              title="Unpublish"
                              className="rounded-lg bg-slate-800 p-1.5 text-amber-400 hover:bg-slate-700"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              remove(
                                article.id
                              )
                            }
                            title="Delete"
                            className="rounded-lg bg-rose-950/60 p-1.5 text-rose-400 hover:bg-rose-900/60"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-slate-400">
            No articles yet. Create your first article.
          </p>
        )}
      </section>

      {/* =====================================================
          CREATE / EDIT MODAL
         ===================================================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 p-5">
              <div>
                <h2 className="font-bold text-white">
                  {editing
                    ? 'Edit Article'
                    : 'New Article'}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create detailed, informative sustainability content.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                <X className="h-5 w-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form
              onSubmit={save}
              className="space-y-5 p-5"
            >
              {field(
                'title',
                'Title',
                'text',
                true
              )}

              {field(
                'category',
                'Category',
                'text',
                true
              )}

              {field(
                'shortDescription',
                'Short Description',
                'text',
                true
              )}

              {field(
                'content',
                'Detailed Article Content',
                'textarea',
                true
              )}

              {/* CONTENT INFORMATION */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText className="h-4 w-4 text-emerald-400" />

                  {getWordCount(
                    form.content
                  )}{' '}
                  words ·{' '}
                  {form.content.length}{' '}
                  characters
                </div>

                <span
                  className={`text-xs font-semibold ${
                    form.content.trim()
                      .length >=
                    MIN_ARTICLE_CONTENT_LENGTH
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  Minimum:{' '}
                  {
                    MIN_ARTICLE_CONTENT_LENGTH
                  }{' '}
                  characters
                </span>
              </div>

              <ImagePicker
                existingUrl={
                  editing?.coverImage ||
                  null
                }
                fallbackUrl={getArticleImage(
                  form
                )}
                onFileChange={
                  setImageFile
                }
                imageError={imageError}
                setImageError={
                  setImageError
                }
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          status:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                    <option value="UNPUBLISHED">
                      Unpublished
                    </option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={
                        form.visibleToUsers
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            visibleToUsers:
                              event
                                .target
                                .checked,
                          })
                        )
                      }
                      className="rounded"
                    />

                    Visible to Users
                  </label>
                </div>
              </div>

              {errors.general && (
                <p className="flex items-center gap-1 text-xs text-rose-400">
                  <AlertCircle className="h-3 w-3" />

                  {errors.general}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />

                  {saving
                    ? 'Saving…'
                    : editing
                    ? 'Update Article'
                    : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          PREVIEW MODAL
         ===================================================== */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 p-5">
              <h2 className="font-bold text-white">
                Article Preview
              </h2>

              <button
                type="button"
                onClick={() =>
                  setPreview(null)
                }
              >
                <X className="h-5 w-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <SafeImg
                src={
                  preview.coverImage ||
                  getArticleImage(
                    preview
                  )
                }
                fallbackSrc={getArticleImage(
                  preview
                )}
                alt={preview.title}
                className="max-h-72 w-full rounded-xl"
              />

              <span className="text-xs font-bold uppercase text-emerald-400">
                {preview.category}
              </span>

              <h3 className="text-2xl font-extrabold text-white">
                {preview.title}
              </h3>

              <p className="text-sm leading-6 text-slate-400">
                {preview.shortDescription}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span>
                  {preview.author ||
                    'EcoTrack Admin'}
                </span>

                <span>
                  {getWordCount(
                    preview.content
                  )}{' '}
                  words
                </span>

                <span>
                  {formatCreatedAt(
                    preview.createdAt
                  )}
                </span>
              </div>

              <div className="border-t border-slate-700 pt-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {preview.content}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  openArticle(preview);
                }}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400"
              >
                <BookOpen className="h-4 w-4" />

                Read Full Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <Pagination
        page={safePage}
        pageSize={pageSize}
        total={filteredArticles.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </main>
  );
}