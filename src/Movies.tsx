import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar} from "react-icons/fa";

const App: React.FC = () => {
  const [movieData, setMovieData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const loadMoreData = () => {
    // Tăng số trang lên khi người dùng bấm nút "Load more"
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    axios
      .get("https://api.themoviedb.org/3/movie/top_rated", {
        params: {
          api_key: "e591ec5aa28bdc2d8090769a197cdbbe",
          page: page,
        },
      })
      .then((response) => {
        // Chỉ sử dụng 10 phim từ kết quả mới
        const newMovies = response.data.results.slice(0, 10);
        // Nếu trang hiện tại là 1, thì set dữ liệu mới bằng 10 phim đầu tiên
        // Nếu trang hiện tại > 1, nối dữ liệu mới vào dữ liệu cũ
        setMovieData((prevData) =>
          page === 1 ? newMovies : [...prevData, ...newMovies]
        );
      })
      .catch((error) => {
        console.error("Error fetching movie data:", error);
      });
  }, [page]); // Theo dõi thay đổi của trang để tự động tải thêm dữ liệu

  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating / 2); // Chuyển đổi rating về từ 0-10 thành 0-5

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} className="star-icon" />);
      } else {
        stars.push(
          <FaStar key={i} className="star-icon" style={{ opacity: 0.5 }} />
        );
      }
    }
    return stars;
  };

  return (
    <div>
      <h1>Top Rated Movies</h1>
      <div>
        <ul>
          {movieData.map((movie: any) => (
            <li key={movie.id}>
              <p>
                <b>{movie.title}:</b>
              </p>

              {
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
              }
              <p>
                <b>{renderStars(movie.vote_average)}</b>
                <span>{movie.vote_average}</span>
                <span>{movie.vote_count}</span>
              </p>
            </li>
          ))}
        </ul>
        <button onClick={loadMoreData}>Load more</button>
      </div>
    </div>
  );
};

export default App;
