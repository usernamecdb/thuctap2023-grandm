import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyCxx2h_NqJOi3oFyQdK_kVHn9xVDp7bXRs",
  authDomain: "movieproject-2853c.firebaseapp.com",
  projectId: "movieproject-2853c",
  storageBucket: "movieproject-2853c.appspot.com",
  messagingSenderId: "475837657128",
  appId: "1:475837657128:web:da20b3d085c0c06dcf451d",
  measurementId: "G-WB3X8LMCBJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [movieTitle, setMovieTitle] = useState("");
  const [movieContent, setMovieContent] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  const createMovie = async () => {
    try {
      if (selectedMovie) {
        // Nếu có phim được chọn, thực hiện cập nhật
        await updateDoc(doc(db, "Movies", selectedMovie.id), { title: movieTitle, content: movieContent });
      } else {
        // Nếu không có phim được chọn, thực hiện thêm mới
        await setDoc(doc(db, "Movies", movieTitle), { title: movieTitle, content: movieContent });
      }
      console.log("Đã lưu phim thành công!");
      setMovieTitle("");
      setMovieContent("");
      setSelectedMovie(null); // Đặt lại giá trị của selectedMovie sau khi lưu
      fetchMovies();
    } catch (error) {
      console.error("Lỗi khi lưu phim: ", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const getData = await getDocs(collection(db, "Movies"));
      const movieList: any[] = [];
      getData.forEach((doc) => {
        movieList.push({ id: doc.id, ...doc.data() });
      });
      setMovies(movieList);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu phim: ", error);
    }
  };

  const deleteMovie = async (movieId: string) => {
    try {
      await deleteDoc(doc(db, "Movies", movieId));
      console.log("Đã xóa phim thành công!");
      fetchMovies();
    } catch (error) {
      console.error("Lỗi khi xóa phim: ", error);
    }
  };

  const editMovie = (movie: any) => {
    // Đặt giá trị của selectedMovie để hiển thị trong form và cho biết là đang cập nhật
    setMovieTitle(movie.title);
    setMovieContent(movie.content);
    setSelectedMovie(movie);
  };

  const clearForm = () => {
    setMovieTitle("");
    setMovieContent("");
    setSelectedMovie(null);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div>
      <h1>Thêm Tên Phim và Nội Dung</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMovie();
        }}
      >
        <label>
          Tên Phim:
          <input
            type="text"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
          />
        </label>
        <br />
        <label>
          Nội Dung:
          <textarea
            value={movieContent}
            onChange={(e) => setMovieContent(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">{selectedMovie ? "Cập Nhật" : "Thêm Phim"}</button>
        <button type="button" onClick={clearForm}>Hủy</button>
      </form>

      <h2>Danh Sách Phim</h2>
      <ul>
        {movies.map((movie, index) => (
          <li key={index}>
            <strong>Title:</strong> {movie.title}, <strong>Content:</strong> {movie.content}
            <button onClick={() => editMovie(movie)}>Cập Nhật</button>
            <button onClick={() => deleteMovie(movie.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}


export default App;
