import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Container } from "@mui/material";
import Heart from "./heart";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";

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

const App: React.FC = () => {
  const [movieData, setMovieData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);

  const loadMoreData = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favoritesCollection = collection(db, "favoriteMovies");
        const favoritesSnapshot = await getDocs(favoritesCollection);
        const favoritesList = favoritesSnapshot.docs.map((doc) =>
          parseInt(doc.id)
        );
        setFavorites(favoritesList);
        localStorage.setItem("favorites", JSON.stringify(favoritesList));
      } catch (error) {
        console.error("Error fetching favorites from Firestore:", error);
      }
    };

    fetchFavorites();

    const fetchMovieData = async (currentPage: number) => {
      try {
        const response = await axios.get(
          "https://api.themoviedb.org/3/movie/top_rated",
          {
            params: {
              api_key: "e591ec5aa28bdc2d8090769a197cdbbe",
              page: currentPage,
            },
          }
        );
        const newMovies = response.data.results.slice(0, 10);
        setMovieData((prevData) =>
          currentPage === 1 ? newMovies : [...prevData, ...newMovies]
        );
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    fetchMovieData(page);
  }, [page, db]);

  const toggleFavorite = async (index: number) => {
    try {
      const movie = movieData[index];
      const movieRef = doc(db, "favoriteMovies", movie.id.toString());

      const updatedFavorites = [...favorites];
      const isFavorite = updatedFavorites.includes(movie.id);

      if (isFavorite) {
        const indexToRemove = updatedFavorites.indexOf(movie.id);
        updatedFavorites.splice(indexToRemove, 1);
      } else {
        updatedFavorites.push(movie.id);
      }

      setFavorites(updatedFavorites);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

      if (isFavorite) {
        await updateDoc(movieRef, {
          isFavorite: false,
          favorites: arrayRemove(movie.id),
        });
      } else {
        await setDoc(movieRef, {
          isFavorite: true,
          favorites: arrayUnion(movie.id),
        });
      }
    } catch (error) {
      console.error("Error updating favorite status on Firestore:", error);
    }
  };

  return (
    <div>
      <div>
        <Container>
          {movieData.map((movie: any, index: number) => {
            const starsCount: number = Math.min(
              Math.round(movie.vote_average / 2)
            );

            return (
              <Box
                key={movie.id}
                style={{
                  width: "200px",
                  margin: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  width={200}
                  height={300}
                />
                <Box>
                  <b>{movie.title}</b>
                </Box>
                <Box>
                  {[...Array(starsCount)].map((_, starIndex) => (
                    <span key={starIndex}>⭐</span>
                  ))}
                  <span>{movie.vote_average}</span>
                </Box>
                <Heart
                  isFavorite={favorites.includes(movie.id)}
                  onClick={() => toggleFavorite(index)}
                />
              </Box>
            );
          })}
        </Container>
        <Box textAlign="center">
          <button onClick={loadMoreData}>Load more</button>
        </Box>
      </div>
    </div>
  );
};

export default App;
