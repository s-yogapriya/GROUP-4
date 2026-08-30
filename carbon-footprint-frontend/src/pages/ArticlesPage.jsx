import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BookOpen, ArrowLeft, Search, Calendar, User } from 'lucide-react';
import { getArticleImage } from '../constants/categoryImages';
import Pagination from '../components/Pagination';

/*
 * Safely formats the article creation date.
 * This is kept locally in this page so ArticlesPage does not depend
 * on a separate dateTime utility export.
 */
function formatCreatedAt(value) {
  if (!value) return 'Unknown';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString();
}

function CoverImage({ src, alt, className = '' }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex flex-col items-center justify-center gap-2 ${className}`}
      >
        <BookOpen className="h-10 w-10 text-emerald-700" />
        {errored && (
          <span className="text-xs text-slate-500">
            Image unavailable
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Article cover'}
      className={`object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  );
}

function ArticleCard({ article, onClick }) {
  const imageSource =
    (article?.coverImage || '').startsWith('/uploads/articles/')
      ? article.coverImage
      : getArticleImage(article);

  return (
    <article
      className="flex flex-col rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden hover:border-emerald-500/40 transition-all cursor-pointer"
      onClick={() => onClick(article)}
    >
      <CoverImage
        src={imageSource}
        alt={article?.title}
        className="h-44 w-full"
      />

      <div className="flex flex-col flex-1 p-5">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          {article?.category || 'General'}
        </span>

        <h2 className="mt-2 font-bold text-white line-clamp-2">
          {article?.title || 'Untitled Article'}
        </h2>

        <p className="mt-2 text-sm text-slate-400 flex-1 line-clamp-3">
          {article?.shortDescription || 'No description available.'}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 min-w-0">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              Created {formatCreatedAt(article?.createdAt)}
            </span>
          </span>

          <span className="flex items-center gap-1 text-emerald-400 font-semibold whitespace-nowrap">
            Read Article →
          </span>
        </div>
      </div>
    </article>
  );
}

function ArticleDetail({ article, onBack }) {
  const imageSource =
    (article?.coverImage || '').startsWith('/uploads/articles/')
      ? article.coverImage
      : getArticleImage(article);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Articles
      </button>

      <CoverImage
        src={imageSource}
        alt={article?.title}
        className="w-full rounded-2xl max-h-72"
      />

      <div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          {article?.category || 'General'}
        </span>

        <h1 className="mt-2 text-2xl font-extrabold text-white">
          {article?.title || 'Untitled Article'}
        </h1>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {article?.author || 'Unknown Author'}
          </span>

          {article?.createdAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {formatCreatedAt(article.createdAt)}
            </span>
          )}

          {article?.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Published{' '}
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {article?.content || 'No article content available.'}
        </p>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { id } = useParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');

  /*
   * Load paginated articles.
   */
  useEffect(() => {
    let mounted = true;

    const loadArticles = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(
          `/articles/page?page=${page - 1}&size=${pageSize}`
        );

        console.log('Articles API response:', response.data);

        if (!mounted) return;

        const data = response.data || {};

        setArticles(Array.isArray(data.content) ? data.content : []);
        setTotalRecords(
          typeof data.totalElements === 'number'
            ? data.totalElements
            : 0
        );
      } catch (err) {
        console.error('Failed to load articles:', err);

        if (!mounted) return;

        setArticles([]);
        setTotalRecords(0);
        setError(
          err?.response?.data?.message ||
            'Unable to load articles. Please check whether the backend is running.'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadArticles();

    return () => {
      mounted = false;
    };
  }, [page, pageSize]);

  /*
   * If navigated directly to /user/articles/:id,
   * load that specific article.
   */
  useEffect(() => {
    let mounted = true;

    if (!id) {
      setSelected(null);
      setDetailLoading(false);
      return undefined;
    }

    const loadArticle = async () => {
      setDetailLoading(true);

      try {
        const response = await api.get(`/articles/${id}`);

        console.log('Article detail API response:', response.data);

        if (!mounted) return;

        setSelected(response.data);
      } catch (err) {
        console.error('Failed to load article:', err);

        if (!mounted) return;

        setSelected(null);
        navigate('/user/articles', { replace: true });
      } finally {
        if (mounted) {
          setDetailLoading(false);
        }
      }
    };

    loadArticle();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const categories = [
    'ALL',
    ...new Set(
      articles
        .map((article) => article?.category)
        .filter(Boolean)
    ),
  ];

  const normalizedSearch = search.trim().toLowerCase();

  const visible = articles.filter((article) => {
    const searchableText = [
      article?.title,
      article?.category,
      article?.shortDescription,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchSearch =
      !normalizedSearch ||
      searchableText.includes(normalizedSearch);

    const matchCategory =
      catFilter === 'ALL' ||
      article?.category === catFilter;

    return matchSearch && matchCategory;
  });

  const safePage = Math.max(1, page);

  /*
   * The backend already returns the requested page,
   * so no second client-side pagination is required.
   */
  const paginatedVisible = visible;

  if (detailLoading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-slate-400">Loading article…</p>
      </main>
    );
  }

  if (selected) {
    return (
      <ArticleDetail
        article={selected}
        onBack={() => {
          setSelected(null);
          navigate('/user/articles');
        }}
      />
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">
          Articles
        </h1>

        <p className="text-sm text-slate-400">
          Sustainability insights and environmental guides.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search articles…"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/50 p-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setCatFilter(category);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                catFilter === category
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* API error */}
      {error && !loading && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p className="text-slate-400">
          Loading articles…
        </p>
      ) : visible.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paginatedVisible.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={(selectedArticle) => {
                setSelected(selectedArticle);
                navigate(`/user/articles/${selectedArticle.id}`);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-12 text-center text-slate-400">
          {search || catFilter !== 'ALL'
            ? 'No articles match your search.'
            : 'No published articles available.'}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={safePage}
        pageSize={pageSize}
        total={totalRecords}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
      />
    </main>
  );
}
