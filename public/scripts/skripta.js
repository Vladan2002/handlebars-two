function toggleMenu() {
    var menu = document.getElementById("select-menu");
    menu.classList.toggle("navbar__small__select--active");
}



document.addEventListener("DOMContentLoaded", function () {
if(window.location.href.includes("http://localhost:8080/views/index.html")){return}
    var sliderContainer = document.getElementById("slider-container");
    var slideImages = document.querySelectorAll(".slider__img");
    var prevButton = document.getElementById("prev-slide");
    var nextButton = document.getElementById("next-slide");
    var thumbnails = document.querySelectorAll(".slider__thumbnail");

    var currentIndex = 0;
    var totalSlides = slideImages.length;

    function updateSlider() {
        var offset = -currentIndex * 100;
        sliderContainer.style.transform = "translateX(" + offset + "%)";

        var allThumbnails = document.querySelectorAll(".slider__thumbnail");
        for (var i = 0; i < allThumbnails.length; i++) {
            if (i === currentIndex) {
                allThumbnails[i].classList.add("slider__thumbnail--active");
            } else {
                allThumbnails[i].classList.remove("slider__thumbnail--active");
            }
        }
    }

    for (var i = 0; i < thumbnails.length; i++) {
        (function (i) {
            thumbnails[i].addEventListener("click", function () {
                currentIndex = parseInt(thumbnails[i].dataset.index, 10);
                updateSlider();
            });
        })(i);
    }

    nextButton.addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    });

    prevButton.addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    });

    updateSlider();
});

function categories() {
    var buttons = document.querySelectorAll("#menu button");
    var control = 0;

    if (buttons[1].classList.contains("container__side__menu__button--deactivate-button")) {
        control = 1;
    }

    for (var i = 1; i < buttons.length; i++) {
        if (control === 1) {
            if (buttons[i].hasAttribute("data-category")) {
                continue;
            }
            buttons[i].classList.remove("container__side__menu__button--deactivate-button");
        } else {
            buttons[i].classList.add("container__side__menu__button--deactivate-button");
        }
    }
}

function navbar(element) {
    var a = document.querySelectorAll("#select-menu a");
    for (var i = 0; i < a.length; i++) {
        if (a[i].classList.contains("navbar__small__select__button--active")) {
            a[i].classList.remove("navbar__small__select__button--active");
        }
    }
    element.classList.add("navbar__small__select__button--active");
}

function toggleSubcategories(category) {
    var subcategories = document.querySelectorAll('.container__side__menu__button--subcategory[data-category="' + category + '"]');

    for (var i = 0; i < subcategories.length; i++) {
        subcategories[i].classList.toggle('container__side__menu__button--deactivate-button');
    }
}

function increaseQuantity() {
    var input = document.getElementById("quantity");
    var value = parseInt(input.value, 10);
    if (isNaN(value)) {
        value = 1;
    } else {
        value += 1;
    }
    input.value = value < 10 ? "0" + value : value;
}

function decreaseQuantity() {
    var input = document.getElementById("quantity");
    var value = parseInt(input.value, 10);
    if (value > 1) {
        value -= 1;
    }
    input.value = value < 10 ? "0" + value : value;
}

function openTab(event, tabName) {
    var tabContent = document.getElementsByClassName("main__table__content");
    for (var i = 0; i < tabContent.length; i++) {
        tabContent[i].classList.remove("main__table--active");
    }

    var tabButtons = document.getElementsByClassName("main__table__tabs__button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("main__table__tabs--active");
    }

    document.getElementById(tabName).classList.add("main__table--active");
    event.currentTarget.classList.add("main__table__tabs--active");
}

function rateStar(rating) {
    var stars = document.querySelectorAll(".fa-star");
    for (var i = 0; i < stars.length; i++) {
        if (i < rating) {
            stars[i].classList.add("main__table__checked");
        } else {
            stars[i].classList.remove("main__table__checked");
        }
    }
    document.getElementById("rating-value").textContent = rating;
}
document.addEventListener("DOMContentLoaded", function () {
    loadTemplate("layouts/header.hbs", "header-container");
    loadTemplate("layouts/footer.hbs", "footer-container");
    loadTemplate("partials/indexSlider.hbs", "slider");

});

var images = document.querySelectorAll(".container__products__slider__show img");
var number = images.length;
var slide = 1;
var progress = 100 / number;
var bar = document.getElementById("progress");

function slider(prev) {
    if (prev) {
        if (slide === number) {
            images[0].classList.remove("container__products__slider__show__img--active");
        } else {
            images[slide].classList.remove("container__products__slider__show__img--active");
        }
    } else {
        if (slide > 1) {
            images[slide - 2].classList.remove("container__products__slider__show__img--active");
        } else {
            images[number - 1].classList.remove("container__products__slider__show__img--active");
        }
    }
    images[slide - 1].classList.add("container__products__slider__show__img--active");
    bar.style.width = (slide * progress) + "%";
}

function plusSlide() {
    slide = (slide % number) + 1;
    slider(false);
}

function minusSlide() {


    if (slide > 1) {
        slide--;
    } else {
        slide = number;
    }
    slider(true);
}

document.addEventListener("DOMContentLoaded", async function () {
    const [productsResponse, cardResponse] = await Promise.all([
        axios.get('/views/partials/productsSection.hbs'),
        axios.get('/views/partials/card.hbs')
    ]);
    Handlebars.registerPartial('productsSection', productsResponse.data);
    Handlebars.registerPartial('card', cardResponse.data);

    var sections = [
        { color: "dark", name: "Vruća ponuda", icon: "fa-solid fa-fire", param: 0, cards: []},
        { color: "", name: "AKCIJA - POPUSTI", icon: "fa-solid fa-tag fa-rotate-90", param: 1, cards: [],loaderId:"adasd"},
        { color: "", name: "Preporučujemo", icon: "fa-solid fa-star", param: 2, cards: []},
        { color: "", name: "Novo u ponudi", icon: "fa-solid fa-heart", param: 3, cards: [] },
        { color: "yellow", name: "Rasprodaja", icon: "fa-solid fa-sun", param: 4, cards: []}
    ];

    var templateSource = document.getElementById("product-template").innerHTML;
    var template = Handlebars.compile(templateSource);

    document.getElementById("product-content").innerHTML = template({ products: sections });
    async function loadSection(section, index) {


        await new Promise(resolve => setTimeout(resolve, 500));

        var products = await prod(section.param);
        if (products.length === 0) {
            sections[index].empty = "jeste";

        } else {
            sections[index].cards = products;
        }
        console.log(sections);


        sections[index].cards = products;
        var sectionHtml = Handlebars.compile(document.getElementById("product-template").innerHTML)({ products: sections });
        document.getElementById("product-content").innerHTML = sectionHtml;


    }


    for (var i = 0; i < sections.length; i++) {
        await loadSection(sections[i], i);
    }
});
async function prod(parametar) {
    let url = "http://localhost:5000/products";


    if (parametar === 0) url += "?discount_gte=0&_limit=4";
    else if (parametar === 1) url += "?discount_gte=5&_limit=8";
    else if (parametar === 2) url += "?discount_gte=0&_limit=4";
    else if (parametar === 3) url += "?discount_gte=100&_limit=4";
    else if (parametar === 4) url += "?discount_gte=970&_limit=4";

    try {
        const response = await axios.get(url);
        var products = response.data;

        var imagePromises = products.map(async (product, index) => {

            try {
                var imageResponse = await axios.get(`http://localhost:5000/images?product_id=${product.id}&_limit=1`);


                products[index].image = imageResponse.data[0]?.source ||   "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
            products[index].newPrice = product.discount > 0
                    ? (product.price - (product.price * product.discount / 100)).toFixed(2)
                    : product.price;
            } catch (err) {
                console.error(`Greška pri učitavanju slike za proizvod ${product.name}`, err);
                products[index].image = "default_image_url";
            }
        });


        await Promise.all(imagePromises);

        return products;
    } catch (error) {
        console.error("Greška pri preuzimanju podataka:", error);
        return [];
    }
}




document.addEventListener("DOMContentLoaded", function () {
    axios.get("/views/partials/accordion.hbs").then((accordionResponse) => {
        Handlebars.registerPartial("accordion", accordionResponse.data);

        Promise.all([
            axios.get("http://localhost:5000/categories"),
            axios.get("http://localhost:5000/subcategories"),
        ]).then((categoriesResponse) => {

            var categories = categoriesResponse[0].data;
            var subCat= categoriesResponse[1].data;

            categories.forEach((category) => {
                category.subcategories=[]
                subCat.forEach((subCategory) => {
                    if(subCategory.category_id == category.id) {
                        category.subcategories.push(subCategory);
                    }

                })

            })



            var menuTemplateSource = document.getElementById("menu-template").innerHTML;
            var menuTemplate = Handlebars.compile(menuTemplateSource);
            var menuHtml = menuTemplate({ categories });

            var k=document.getElementById("container__side").innerHTML
            document.getElementById("container__side").innerHTML = menuHtml+k;
        })

    }).catch((error) => {
        console.error("Greška prilikom učitavanja partiala:", error);
    });
});








    function loadPosts() {
        axios.get("/views/partials/post.hbs")
            .then((response) => {
                Handlebars.registerPartial("post", response.data);

                const postTemplateSource = response.data;
                const postTemplate = Handlebars.compile(postTemplateSource);

                let postsHtml = "";
                for (let i = 0; i < 2; i++) {
                    postsHtml += postTemplate();
                }

                document.getElementById("container__side").innerHTML += postsHtml;
            })
            .catch((error) => {
                console.error("Greška prilikom učitavanja post.hbs:", error);
            });
    }
function loadsSearch() {
    axios.get("/views/partials/ad.hbs")
        .then((adResponse) => {
            Handlebars.registerPartial("ad", adResponse.data);
            return axios.get("/views/partials/search.hbs");
        })
        .then((searchResponse) => {
            Handlebars.registerPartial("search", searchResponse.data);

            const searchTemplate = Handlebars.compile(searchResponse.data);
            const searchHtml = searchTemplate();

            document.getElementById("container__side").insertAdjacentHTML("beforeend", searchHtml);
            loadPosts();
            axios.get("/views/partials/ad.hbs").then((adResponse) => {
                const adTemplate = Handlebars.compile(adResponse.data);
                const adHtml = adTemplate();
                document.getElementById("container__side").insertAdjacentHTML("beforeend", adHtml);


            });
        })
        .catch((error) => {
            console.error("Greška prilikom učitavanja partiala:", error);
        });
}
    loadsSearch();


function loadTemplate(url, target, data = {}) {
    axios.get(url)
        .then(response => {
            let template = Handlebars.compile(response.data);
            document.getElementById(target).innerHTML = template(data);
        })
        .catch(error => console.error(`Error loading ${url}:`, error));
}

function kartica(id) {
    //window.location.href = `http://localhost:8080/views/product-id.html?id=${id}`;
    //window.location.assign( `http://localhost:8080/views/product-id.html?id=${id}`);
    //location = `http://localhost:8080/views/product-id.html?id=${id}`;
    //document.location = `http://localhost:8080/views/product-id.html?id=${id}`;
    fetch(`http://localhost:8080/views/product-id.html?id=${id}`)
        .then(response => {
            window.location.href = response.url;
        });

}