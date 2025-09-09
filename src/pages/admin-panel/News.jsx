import { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import { BASE_URL } from "../../config";
import { FaChevronDown } from "react-icons/fa";

// deletes are not used
// but to be used hahaha, for soft delete

const News = () => {
  const [statusFilter, setStatusFilter] = useState("all"); // all | draft | published | archived
  const [formErrors, setFormErrors] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [deletingNewsId, setDeletingNewsId] = useState(null);

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
    isDraft: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsIdToDelete, setNewsIdToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const categoryLabels = {
    all: "All News", //
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

const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const res = await axios.get(`${BASE_URL}/api/news`, {
            // Send all filters to the API
            params: {
                category: filterCategory !== "all" ? filterCategory : undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                search: search || undefined,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        setNewsList(res.data);
    } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Failed to load news. Please try again later.");
    } finally {
        setIsLoading(false);
    }
};

  useEffect(() => {
    fetchNews();
}, [filterCategory, statusFilter, search]); // Add dependencies

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
  
      const data = { ...formData, status };
  
      if (editingNewsId) {
        await axios.put(`${BASE_URL}/api/news/${editingNewsId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${BASE_URL}/api/news`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      await fetchNews();
      setFormData({
        title: "",
        content: "",
        image: "",
        category: "general",
        isDraft: false,
      });
      setEditingNewsId(null);
      setShowModal(false);
      setError("");
      setFormErrors({ title: "", content: "", image: "" });
    } catch (err) {
      console.error("Failed to submit news:", err.response?.data || err.message);
      setError("Failed to submit news. Please try again.");
    } finally {
      setIsPublishing(false);
      setIsUpdating(false);
      setIsSavingDraft(false);
    }
  };

  // const openDeleteModal = (id) => {
  //   setNewsIdToDelete(id);
  //   setShowDeleteModal(true);
  // };

  const closeDeleteModal = () => {
    setNewsIdToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    try {
      setDeletingNewsId(newsIdToDelete); // start loading spinner
      await axios.delete(`${BASE_URL}/api/news/${newsIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewsList(newsList.filter((n) => n._id !== newsIdToDelete));
      closeDeleteModal();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete news. Please try again.");
    } finally {
      setDeletingNewsId(null); // stop loading spinner
    }
  };

  const openEdit = (news) => {
    setFormData({
      title: news.title,
      content: news.content,
      image: news.image,
      category: news.category,
      isDraft: news.status === "draft",
      isArchived: news.isArchived, // loooooool i forgot
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

  const filteredNews = newsList.filter((news) => {
    const searchMatch = news.title.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = filterCategory === "all" || news.category === filterCategory;
    
    let statusMatch = true;
    if (statusFilter === "published") statusMatch = news.status === "published" && !news.isArchived;
    else if (statusFilter === "draft") statusMatch = news.status === "draft" && !news.isArchived;
    else if (statusFilter === "archived") statusMatch = news.isArchived;
  
    return searchMatch && categoryMatch && statusMatch;
  });

  const handlePublish = async (newsId) => {
    try {
      setIsLoading(true);
      await axios.put(
        `${BASE_URL}/api/news/${newsId}`,
        { isDraft: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNews();
    } catch (err) {
      console.error("Publish failed:", err);
      setError("Failed to publish news. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveToggle = async (newsId, shouldArchive) => {
    try {
      setIsLoading(true);
      await axios.put(
        `${BASE_URL}/api/news/archive/${newsId}`,
        { isArchived: shouldArchive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNews();
    } catch (err) {
      console.error("Archive toggle failed:", err);
      setError("Failed to archive/unarchive news.");
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------M---------------------------------------

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
        className="shadow-sm border  border-gray-500 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-inter py-2 px-4 cursor-pointer appearance-none pr-8 w-full md:w-[200px]"
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
        isDraft: false,
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      ) : filteredNews.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
          {filteredNews.map((news) => (
            <div
              key={news._id}
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
                  {news.isDraft && (
                    <button
                      onClick={() => handlePublish(news._id)}
                      className="bg-blue-500 text-white hover:bg-blue-400 transition text-sm px-5 py-3 rounded-md"
                      disabled={isLoading}
                    >
                      {isLoading ? "Publishing..." : "Publish"}
                    </button>
                  )}

                  <div className="flex justify-start gap-2 mt-auto">
                  {news.isArchived ? (
                    <button
                      onClick={() => handleArchiveToggle(news._id, false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white transition text-sm px-5 py-3 rounded-md"
                      disabled={isLoading}
                    >
                      Unarchive
                    </button>
                  ) : (
                    news.status === "published" && (
                      <button
                        onClick={() => handleArchiveToggle(news._id, true)}
                        className="bg-red-500 hover:bg-red-600 text-white transition text-sm px-5 py-3 rounded-md"
                        disabled={isLoading}
                      >
                        Archive
                      </button>
                    )
                  )}

                    <button
                      onClick={() => openEdit(news)}
                      className="bg-yellow-400 text-yellow-800 hover:bg-yellow-300 transition text-sm px-5 py-3 rounded-md"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center md:w-[300px] h-auto p-4">
  <div className="w-full h-[220px] bg-gray-100 border-l border-gray-300 rounded-lg overflow-hidden shadow-md">
    <img
      src={news.image}
      alt={news.title}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      onError={(e) => {
        e.target.src = "https://via.placeholder.com/300x220?text=No+Image";
      }}
    />
  </div>
</div>
            </div>
          ))}
        </div>
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
                    .filter(([key]) => key !== "all") // ⛔ Exclude "all"
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
{formErrors.image && (
  <p className="text-sm text-red-500 mt-1">{formErrors.image}</p>
)}
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
              </div>

              {/* Preview */}
              {formData.image && (
                <div className="border rounded-lg p-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded object-contain"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200?text=Image+not+found";
                    }}
                  />
                </div>
              )}
              {/*  */}
              <div className="flex flex-wrap justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>

                {editingNewsId && formData.isDraft && !formData.isArchived && (
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

                {/*  */}

                {!editingNewsId && (
                  <>
                    {/* Save as Draft */}
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
              {/*  */}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm flex items-center justify-center z-50 transition duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-[#0A8F28] rounded-t-lg py-3 px-6">
              <h3 className="text-lg font-semibold text-white">
                Confirm Delete
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this news?
              </p>
            </div>
            <div className="flex justify-end gap-4 mb-6 mr-5">
              <button
                onClick={closeDeleteModal}
                className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingNewsId === newsIdToDelete}
                className={`px-6 py-2 rounded-md text-white transition-colors flex items-center justify-center ${
                  deletingNewsId === newsIdToDelete
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {deletingNewsId === newsIdToDelete ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;