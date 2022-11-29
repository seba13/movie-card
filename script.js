let rating = document.querySelectorAll(".rating");
let input = document.getElementById("search");
let message = document.querySelector(".message");
let tooltip = null;
let btn = document.querySelector('label[for="search"] i'); //Lupa

addEventListener(
  "load",
  loadCards(
    `https://api.themoviedb.org/3/movie/popular?api_key=6b74f22501d13a6e19db7310ee68fe76&language=es-MX&page=1`
  )
);

document.body.addEventListener("input", filter);
document.body.addEventListener("click", updateRating);
// document.body.addEventListener("mouseover", hoverCard);
// document.body.addEventListener("mouseout", hoverCard);
document.body.addEventListener("click", search);

input.addEventListener("keydown", (event) => {

  
  if (event.code == "Enter" && input.value.trim != "") {
    btn.click();
  }
});

function search(event) {
  if (event.target.tagName == "I") {
    let cards = Array.from(document.querySelectorAll(".card"));

    let input = event.target.parentElement.previousElementSibling;

    if (input.value.trim() != "") {
      cards.forEach((card) => {
        card.remove();
      });
      loadCards(
        `https://api.themoviedb.org/3/search/movie?api_key=6b74f22501d13a6e19db7310ee68fe76&language=es-MX&query=${input.value}&page=1&include_adult=false`
      );

      cards = Array.from(document.querySelectorAll(".card"));

      message.style.display = "none";
    }
  }
}

message.innerHTML = "Sin coincidencias \u{1F974}";

async function loadCards(string) {
  try {
    let fetchUrl = await fetch(string);

    let json = await fetchUrl.json();
    let movieList = json.results;

    movieList.forEach(async (el) => {
      // console.log(el);

      let movieData = await (
        await fetch(
          `https://api.themoviedb.org/3/movie/${el.id}?api_key=6b74f22501d13a6e19db7310ee68fe76&language=es-MX`
        )
      ).json();

      let castList = await (
        await fetch(
          `https://api.themoviedb.org/3/movie/${el.id}/credits?api_key=6b74f22501d13a6e19db7310ee68fe76&language=es-MX`
        )
      ).json();

      // castList.forEach(el => console.log(el.known_for_department))

      // console.log(castList);

      // console.log(movieData);
      let card = document.createElement("DIV");
      card.setAttribute("data-title", el.title);
      card.classList.add("card");

      let poster = document.createElement("DIV");
      poster.classList.add("poster");

      let imgPoster = document.createElement("IMG");

      let posterUrl = "";
      if (movieData.poster_path) {
        posterUrl = `https://image.tmdb.org/t/p/w500/${movieData.poster_path}`;
      } else {
        posterUrl =
          "https://i.pinimg.com/736x/88/99/7e/88997e72673d6d7d55a9c998217befd6.jpg";
      }

      imgPoster.setAttribute("src", posterUrl);

      imgPoster.setAttribute("width", "320");
      imgPoster.setAttribute("height", "480");

      poster.append(imgPoster);

      let details = document.createElement("DIV");
      details.classList.add("details");

      let detailsTitle = document.createElement("H2");
      detailsTitle.textContent = el.title;

      let directedH3 = document.createElement("H3");
      let directors = castList.crew
        .filter((el) => el.known_for_department == "Directing")
        .map((el) => el.name);

      directedH3.textContent =
        "Directed by " + (directors.join(", ") || "Sin Información");

      let rating = document.createElement("DIV");
      rating.classList.add("rating");

      let voteAverage = Math.round(movieData.vote_average / 2);

      for (let indexStar = 0; indexStar < 5; indexStar++) {
        let star = document.createElement("I");
        star.classList.add("fa-star");

        if (indexStar < voteAverage) {
          star.classList.add("fa-solid");
        } else {
          star.classList.add("fa-regular");
        }

        rating.append(star);
      }

      let tags = document.createElement("tags");
      tags.classList.add("tags");

      let genres = movieData.genres;

      for (let tag of genres) {
        let genre = document.createElement("SPAN");
        genre.textContent = tag.name;

        tags.append(genre);
      }

      let info = document.createElement("DIV");
      info.classList.add("info");

      let description = document.createElement("P");
      description.textContent = movieData.overview;

      info.append(description);

      let cast = document.createElement("DIV");
      cast.classList.add("cast");

      let titleCast = document.createElement("H4");
      titleCast.textContent = "Cast";

      cast.append(titleCast);

      let ulCast = document.createElement("UL");

      // console.log(castList.cast);

      for (let indexCast = 0; indexCast <= castList.cast.length; indexCast++) {
        if (indexCast >= 5) {
          break;
        }

        let liCast = document.createElement("LI");
        let imgCast = document.createElement("IMG");

        let urlImg = "";

        if (castList.cast[indexCast]) {
          urlImg =
            castList.cast[indexCast].profile_path || movieData.poster_path;
        }

        // console.log(urlImg);

        if (urlImg != "") {
          imgCast.setAttribute(
            "src",
            `https://image.tmdb.org/t/p/w45/${urlImg}`
          );
        } else {
          imgCast.setAttribute(
            "src",
            "https://cdn-icons-png.flaticon.com/128/2748/2748583.png"
          );
        }

        liCast.append(imgCast);

        ulCast.append(liCast);
      }

      cast.append(ulCast);

      details.append(detailsTitle);
      details.append(directedH3);
      details.append(rating);
      details.append(tags);
      details.append(info);
      details.append(cast);

      card.append(poster);
      card.append(details);

      document.body.append(card);
    });
  } catch (ex) {
    alert(ex);
  }
}

function filter(event) {
  let cardList = Array.from(document.querySelectorAll(".card"));

  let target = event.target;

  if (target.tagName == "INPUT") {
    cardList.forEach((el) => {
      if (
        el.dataset.title
          .toLowerCase()
          .includes(target.value.trim().toLowerCase())
      ) {
        el.style.display = "";
      } else {
        el.style.display = "none";
      }
    });

    if (
      cardList.every((el) => {
        return el.style.display == "none";
      }) == true
    ) {
      message.style.display = "block";
    } else {
      message.style.display = "";
    }
  } else if (target.tagName == "SELECT") {
    let cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
      card.remove();
    });

    let string = `https://api.themoviedb.org/3/movie/${target.value}?api_key=6b74f22501d13a6e19db7310ee68fe76&language=es-MX&page=1`;
    loadCards(string);
  }
}

function hoverCard(event) {
  let target = "";

  if (event.target.closest("div.card")) {
    target = event.target;

    let card = target.closest("div.card");
    let cardInfo = card.querySelector(".info");

    cardInfo.style.height = cardInfo.scrollHeight + "px";
  } else {
    target = event.relatedTarget; //relatedTarget puede ser null
    let card = target.closest("div.card") || undefined;
    if (card) {
      let cardInfo = card.querySelector(".info");
      cardInfo.style.height = "";
    }
  }
}

function updateRating(event) {
  let target = event.target;
  if (target.tagName == "I" && target.closest("div.rating")) {
    let parent = target.closest("div.rating");
    let rating = parent.lastElementChild;
    let starList = Array.from(parent.querySelectorAll("i"));

    let indexTarget = starList.indexOf(target);

    for (let el in starList) {
      if (el <= indexTarget) {
        if (!starList[el].classList.contains("fa-solid")) {
          starList[el].classList.remove("fa-regular");
          starList[el].classList.add("fa-solid");
        }
      } else {
        if (starList[el].classList.contains("fa-solid")) {
          starList[el].classList.add("fa-regular");
          starList[el].classList.remove("fa-solid");
        }
      }
    }

    rating.textContent = rating.textContent.replace(
      rating.textContent.split("/")[0],
      starList.filter((el) => el.classList.contains("fa-solid")).length
    );
  }
}
