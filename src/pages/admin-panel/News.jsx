import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import { BASE_URL } from "../../config";
import { FaChevronDown } from "react-icons/fa";

const News = () => {
  const [statusFilter, setStatusFilter] = useState("all"); // all | draft | published | archived
  const [formErrors, setFormErrors] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [archiveLoading, setArchiveLoading] = useState({}); // Track archive loading per news item

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [newsList, setNewsList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    category: "general",
    status: "draft", // Use status instead of isDraft
  });

  // Infinite scrolling states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  
  // Refs for infinite scrolling
  const observer = useRef();
  const lastNewsElementRef = useCallback(node => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore]);

  const categoryLabels = {
    all: "All News",
    general: "General News",
    maintenance: "Maintenance Schedule",
    brownout: "Brownout Schedule",
  };

  const statusLabels = {
    all: "All Status",
    published: "Published",
    draft: "Draft",
    archived: "Archived",
  };

  const token = localStorage.getItem("token");

  const fetchNews = async (page = 1, isLoadMore = false) => {
    if (page === 1) {
      setIsLoading(true);
      setNewsList([]);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);
    
    try {
      // Build query params based on filters
      const params = {
        page: page,
        limit: 10
      };
      
      // Category filter
      if (filterCategory !== "all") {
        params.category = filterCategory;
      }
      
      // Status filter
      if (statusFilter === "archived") {
        params.includeArchived = "true";
      } else if (statusFilter !== "all") {
        params.status = statusFilter;
      } else {
        // For "all", include archived
        params.includeArchived = "true";
      }

      console.log("Fetching news with params:", params); // Debug log

      const res = await axios.get(`${BASE_URL}/api/news`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      let newsData = res.data.news || res.data; // Handle both response formats
      const pagination = res.data.pagination;

      // Client-side filtering for archived status
      if (statusFilter === "archived") {
        newsData = newsData.filter(news => news.isArchived === true);
      } else if (statusFilter !== "all") {
        newsData = newsData.filter(news => news.isArchived !== true);
      }

      // Search filter (client-side for now)
      if (search.trim()) {
        newsData = newsData.filter(news => 
          news.title.toLowerCase().includes(search.toLowerCase()) ||
          news.content.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (page === 1) {
        setNewsList(newsData);
      } else {
        setNewsList(prev => [...prev, ...newsData]);
      }
      
      // Update pagination info
      if (pagination) {
        setHasMore(pagination.hasMore);
      } else {
        setHasMore(false);
      }
      
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError("Failed to load news. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Function to refresh the news list after operations
  const refreshNewsList = async () => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchNews(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchNews(1);
  }, [filterCategory, statusFilter, search]);

  // Load more when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchNews(currentPage, true);
    }
  }, [currentPage]);

  const handleSubmit = async (status) => {
    // Validate input
    const errors = {
      title: !formData.title.trim() ? "Title is required." : "",
      content: !formData.content.trim() ? "Content is required." : "",
      image: !formData.image.trim() ? "Image URL or upload is required." : "",
    };

    setFormErrors(errors);

    const hasError = Object.values(errors).some((msg) => msg !== "");
    if (hasError) return;

    try {
      if (status === "draft") setIsSavingDraft(true);
      else if (status === "published") setIsPublishing(true);
      else setIsUpdating(true);

      // Handle image upload if it's a base64 data URL
      let imageUrl = formData.image;
      if (formData.image.startsWith("data:")) {
        // Convert base64 to file and upload
        const response = await fetch(formData.image);
        const blob = await response.blob();
        const file = new File([blob], "news-image.png", { type: "image/png" });
        
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);
        
        const uploadResponse = await axios.post(`${BASE_URL}/api/news/upload-image`, formDataUpload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });
        
        imageUrl = uploadResponse.data.imageUrl;
      }

      const data = { 
        title: formData.title,
        content: formData.content,
        image: imageUrl,
        category: formData.category,
        status 
      };

      console.log("Submitting data:", data); // Debug log

      if (editingNewsId) {
        const response = await axios.put(`${BASE_URL}/api/news/${editingNewsId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Refresh the news list to get updated data
        await refreshNewsList();
      } else {
        const response = await axios.post(`${BASE_URL}/api/news`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Refresh the news list to get updated data
        await refreshNewsList();
      }

      setFormData({
        title: "",
        content: "",
        image: "",
        category: "general",
        status: "draft",
      });
      setEditingNewsId(null);
      setShowModal(false);
      setError("");
      setFormErrors({ title: "", content: "", image: "" });
    } catch (err) {
      console.error("Failed to submit news:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to submit news. Please try again.");
    } finally {
      setIsPublishing(false);
      setIsUpdating(false);
      setIsSavingDraft(false);
    }
  };

  const openEdit = (news) => {
    setFormData({
      title: news.title,
      content: news.content,
      image: news.image,
      category: news.category,
      status: news.status,
    });
    setEditingNewsId(news._id);
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const handlePublish = async (newsId) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${BASE_URL}/api/news/${newsId}`,
        { status: "published" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Refresh the news list to get updated data
      await refreshNewsList();
    } catch (err) {
      console.error("Publish failed:", err);
      setError("Failed to publish news. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveToggle = async (newsId, shouldArchive) => {
    try {
      setArchiveLoading(prev => ({ ...prev, [newsId]: true }));
      
      console.log(`${shouldArchive ? 'Archiving' : 'Unarchiving'} news:`, newsId); // Debug log
      
      const response = await axios.put(
        `${BASE_URL}/api/news/archive/${newsId}`,
        { isArchived: shouldArchive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Archive response:", response.data); // Debug log
      
      // Refresh the news list to get updated data
      await refreshNewsList();
      
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Archive toggle failed:", err);
      const errorMsg = err.response?.data?.message || "Failed to archive/unarchive news.";
      setError(errorMsg);
    } finally {
      setArchiveLoading(prev => ({ ...prev, [newsId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <h2 className="text-3xl font-semibold font-inter text-gray-800 mb-5">
        News and Updates
      </h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 mb-8 gap-4 flex-wrap">
        {/* Left Side: Search, Category, Status Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
          {/* Search Input */}
          <div className="flex items-center relative">
            <FiSearch className="text-gray-500 absolute left-2 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 pl-8 border border-gray-500 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-inter w-full md:w-[350px]"
            />
          </div>

          {/* Category Select */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="shadow-sm border border-gray-500 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-inter py-2 px-4 cursor-pointer appearance-none pr-8 w-full md:w-[250px]"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500" />
            </div>
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadow-sm border border-gray-500 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-inter py-2 px-4 cursor-pointer appearance-none pr-8 w-full md:w-[200px]"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500" />
            </div>
          </div>
        </div>

        {/* Right Side: Add News Button */}
        <button
          onClick={() => {
            setShowModal(true);
            setFormData({
              title: "",
              content: "",
              image: "",
              category: "general",
              status: "draft",
            });
            setEditingNewsId(null);
          }}
          className="bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 flex items-center self-start md:self-auto"
        >
          <span>+ Add News</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}

      {isLoading && currentPage === 1 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : newsList.length === 0 && !isLoading ? (
        <div className="bg-gray-50 p-8 rounded-lg">
          <h3 className="mt-4 text-lg font-medium text-gray-900 mb-6">
            No news items found
          </h3>
          <div className="text-left">
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-inter"
            >
              + Add News
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
            {newsList.map((news, index) => (
              <div
                key={news._id}
                ref={index === newsList.length - 1 ? lastNewsElementRef : null}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col-reverse md:flex-row min-h-[300px]"
              >
                {/* Text Content - Left Side */}
                <div className="p-6 flex flex-col ml-15 flex-grow md:w-2/3 overflow-y-auto">
                  {/* Category Tag */}
                  <span
                    className={`
                      inline-block text-base font-semibold px-4 py-1 rounded mb-3 w-fit
                      ${
                        news.category === "brownout"
                          ? "bg-red-100 text-red-600"
                          : news.category === "maintenance"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {categoryLabels[news.category] || news.category}
                  </span>

                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-700 line-clamp-2 mb-1">
                      {news.title}
                    </h3>

                    {/* Status Pill */}
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        news.isArchived
                          ? "bg-gray-500 text-white"
                          : news.status === "draft"
                          ? "bg-yellow-400 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {news.isArchived
                        ? "Archived"
                        : news.status === "draft"
                        ? "Draft"
                        : "Published"}
                    </span>
                  </div>

                  <span className="text-sm font-normal text-gray-400 whitespace-nowrap block mb-5">
                    {formatDate(news.createdAt)}
                  </span>
                  <p className="text-base font-normal text-gray-500 mb-4 line-clamp-5 flex-grow max-h-[120px] overflow-hidden">
                    {news.content}
                  </p>
                  
                  <div className="flex justify-start gap-2 mt-auto">
                    {/* For archived news - only Edit and Unarchive buttons */}
                    {news.isArchived ? (
                      <>
                        <button
                          onClick={() => openEdit(news)}
                          className="bg-yellow-400 text-yellow-800 hover:bg-yellow-300 transition text-sm px-5 py-3 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchiveToggle(news._id, false)}
                          className="bg-blue-600 hover:bg-blue-700 text-white transition text-sm px-5 py-3 rounded-md disabled:opacity-50"
                          disabled={archiveLoading[news._id]}
                        >
                          {archiveLoading[news._id] ? "Unarchiving..." : "Unarchive"}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Publish button for drafts */}
                        {news.status === "draft" && (
                          <button
                            onClick={() => handlePublish(news._id)}
                            className="bg-blue-500 text-white hover:bg-blue-400 transition text-sm px-5 py-3 rounded-md"
                            disabled={isLoading}
                          >
                            {isLoading ? "Publishing..." : "Publish"}
                          </button>
                        )}

                        {/* Archive button for published news */}
                        {news.status === "published" && (
                          <button
                            onClick={() => handleArchiveToggle(news._id, true)}
                            className="bg-red-500 hover:bg-red-600 text-white transition text-sm px-5 py-3 rounded-md disabled:opacity-50"
                            disabled={archiveLoading[news._id]}
                          >
                            {archiveLoading[news._id] ? "Archiving..." : "Archive"}
                          </button>
                        )}

                        <button
                          onClick={() => openEdit(news)}
                          className="bg-yellow-400 text-yellow-800 hover:bg-yellow-300 transition text-sm px-5 py-3 rounded-md"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-center items-center md:w-[300px] h-auto p-4">
                  <div className="w-full h-[220px] bg-gray-100 border-l border-gray-300 rounded-lg overflow-hidden shadow-md">
                      <img
                        src={news.image?.startsWith('data:') ? news.image : news.image?.startsWith('http') ? news.image : news.image?.startsWith('/') ? `${BASE_URL}${news.image}` : `${BASE_URL}/uploads/news/${news.image}`}
                        alt={news.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIyMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
                        }}
                      />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Indicator */}
          {isLoadingMore && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading more news...</span>
            </div>
          )}

          {/* End of Results Indicator */}
          {!hasMore && newsList.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>You've reached the end of all news articles.</p>
            </div>
            )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50 transition duration-300 ease-in-out">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingNewsId ? "Edit News" : "Add News"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter news title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full border ${
                    formErrors.title ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition`}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  placeholder="Enter news content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className={`w-full border ${
                    formErrors.content ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-green-500 outline-none transition resize-none`}
                />
                {formErrors.content && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.content}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="shadow-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-inter py-2 px-4 cursor-pointer appearance-none pr-8 w-full"
                >
                  {Object.entries(categoryLabels)
                    .filter(([key]) => key !== "all")
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
                <div className="absolute inset-y-11 right-2 flex items-center pointer-events-none">
                  <FaChevronDown className="text-gray-500" />
                </div>
              </div>

              {/* Image Upload or URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Upload or URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Or paste image URL"
                    value={
                      formData.image.startsWith("data:") ? "" : formData.image
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className={`w-full border ${
                      formErrors.image ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition`}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="image-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, image: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button
                    onClick={() =>
                      document.getElementById("image-upload").click()
                    }
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Upload
                  </button>
                </div>
                {formErrors.image && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.image}</p>
                )}
              </div>

              {/* Preview */}
              {formData.image && (
                <div className="border rounded-lg p-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                    <img
                      src={formData.image?.startsWith('data:') ? formData.image : formData.image?.startsWith('http') ? formData.image : formData.image?.startsWith('/') ? `${BASE_URL}${formData.image}` : `${BASE_URL}/uploads/news/${formData.image}`}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded object-contain"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
                      }}
                    />
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>

                {/* Show publish button for draft edits */}
                {editingNewsId && formData.status === "draft" && (
                  <button
                    onClick={() => handleSubmit("published")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Publishing..." : "Publish"}
                  </button>
                )}

                {/* Show update for any edit */}
                {editingNewsId && (
                  <button
                    onClick={() => handleSubmit(formData.status)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </button>
                )}

                {/* Show draft/publish for new items */}
                {!editingNewsId && (
                  <>
                    <button
                      onClick={() => handleSubmit("draft")}
                      className="px-6 py-2 bg-yellow-400 text-yellow-800 rounded-lg hover:bg-yellow-500 transition"
                      disabled={isSavingDraft}
                    >
                      {isSavingDraft ? "Saving..." : "Save as Draft"}
                    </button>

                    <button
                      onClick={() => handleSubmit("published")}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      disabled={isPublishing}
                    >
                      {isPublishing ? "Publishing..." : "Publish"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;