var database="http://localhost:5000/"

document.addEventListener("DOMContentLoaded", function () {
    loadTemplate("layouts/header.hbs", "header-container");
    loadTemplate("layouts/footer.hbs", "footer-container");
    loadTemplate("partials/indexSlider.hbs", "slider");

});

async function sections () {
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


        await new Promise(resolve => setTimeout(resolve, 0));

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
};

async function prod(parametar) {
    let url = database+"products";

    if (parametar === 0) url += "?discount_gte=0&_limit=4";
    else if (parametar === 1) url += "?discount_gte=5&_limit=8";
    else if (parametar === 2) url += "?discount_gte=0&_limit=4";
    else if (parametar === 3) url += "?discount_gte=100&_limit=4";
    else if (parametar === 4) url += "?discount_gte=970&_limit=4";

    try {
        const response = await axios.get(url);
        if (!response.data || response.data.length === 0) return [];

        let products = response.data;


        await Promise.all(products.map(fetchProductImageAndPrice));

        return products;
    } catch (error) {
        console.error("Greška prilikom učitavanja proizvoda:", error);
        return [];
    }
}
sections();


async function fetchProductImageAndPrice(product) {
    try {
        let imageResponse = await axios.get(`${database}images?product_id=${product.id}&_limit=1`);

        product.image = imageResponse.data[0]?.source ||
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";

        product.newPrice = product.discount > 0
            ? (product.price - (product.price * product.discount / 100)).toFixed(2)
            : product.price;

    } catch (err) {
        console.error(`Greška pri učitavanju slike za proizvod ${product.name}`, err);
        product.image = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
    }
}




document.addEventListener("DOMContentLoaded", function () {
    axios.get("/views/partials/accordion.hbs").then((accordionResponse) => {
        Handlebars.registerPartial("accordion", accordionResponse.data);

        Promise.all([
            axios.get(`${database}categories`),
            axios.get(`${database}subcategories`),
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

function bottomSomething(){
    var content=document.getElementById("mainContainer");

    axios.get("/views/partials/bottomSomething.hbs")
        .then(response => {
            Handlebars.registerPartial('bottomSomething', response.data);

            var template=Handlebars.compile(response.data);
            console.log(template);
            content.innerHTML += template();
        })

}
bottomSomething();



async function seeAll(parametar) {
    document.getElementById("slider").innerHTML = "";
    document.getElementById("product-content").innerHTML = "";
    document.getElementById("product-content").style.marginTop = "20px";

    try {
        var partial = await axios.get("/views/partials/card.hbs");
        Handlebars.registerPartial("card", partial.data);

        let url = `${database}products`;

        var templateSource = document.getElementById("seeAll-template").innerHTML;
        var template = Handlebars.compile(templateSource);
        var skeleton="nesto"
        document.getElementById("product-content").innerHTML = template({skeleton});

        document.getElementById("backButton").style.display = "none";

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (parametar === 0) url += "?discount_gte=1";
        else if (parametar === 1) url += "?discount_gte=5";
        else if (parametar === 2) url += "?discount_gte=0";
        else if (parametar === 3) url += "?discount_gte=500";
        else if (parametar === 4) url += "?discount_gte=970";

        const response = await axios.get(url);

        if (!response.data || response.data.length === 0) {
            console.warn("Nema proizvoda za prikaz.");
            var templateSource = document.getElementById("seeAll-template").innerHTML;
            var template = Handlebars.compile(templateSource);
            var name="nesto"
            document.getElementById("product-content").innerHTML = template({name});
            return;
        }


        var products = response.data;
        console.log(products);

        await Promise.all(products.map(fetchProductImageAndPrice));


        var templateSource = document.getElementById("seeAll-template").innerHTML;
        var template = Handlebars.compile(templateSource);

        document.getElementById("product-content").innerHTML = template({ products });

    } catch (error) {
        console.error("Greška prilikom učitavanja proizvoda:", error);
    }
}


function handleBackClick() {
    loadTemplate("partials/indexSlider.hbs", "slider");
    sections();

}
