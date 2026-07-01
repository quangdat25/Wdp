import { useEffect, useState, useCallback } from "react";
import { getAllNews } from "../api/newsService";
import { socket } from "../socket";

// Custom hook: fetch danh sách bản tin + realtime socket new_news
// Trả về { news, loading }
export const useNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllNews();
      const data = res.data || [];
      setNews(data);
    } catch (error) {
      console.error("Load news error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Subscribe socket realtime (1 listener duy nhất per hook instance)
  useEffect(() => {
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("accessToken") };
      socket.connect();
    }

    const handleNewNews = (newsItem) => {
      setNews((prev) => {
        const exists = prev.some((item) => item._id === newsItem._id);
        if (exists) return prev;

        // Giữ thứ tự: isPinned lên đầu, sau đó theo thời gian
        const next = [newsItem, ...prev];
        return next.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });
    };

    socket.on("new_news", handleNewNews);

    return () => {
      socket.off("new_news", handleNewNews);
    };
  }, []);

  return { news, loading };
};

export default useNews;
