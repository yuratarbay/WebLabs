const submitButton = document.getElementById("submit_button");
const findButton = document.getElementById("find_button");
const cancelFindButton = document.getElementById("cancel_find_button");
const findInput = document.getElementById("find_input");

const titleinput = document.getElementById("titleinput");
const descriptionArea = document.getElementById("area__desc");
const itemsContainer = document.getElementById("Content");
const commentsinput = document.getElementById("commentsinput");
const Durationinput = document.getElementById("Duration");
const Form = document.getElementById("Form");
const FormInputs = document.querySelectorAll('.Create-inputs');


const Sort = document.getElementById("Sort");

const Count = document.getElementById("Count");
const delete_button = document.getElementById('');

const deleteSetionClass = ".delete-section";


const EDIT_BUTTON_PREFIX = 'edit-button-';

let films = [];
const BASE_URL = "http://localhost:5000/test.films";
const RESOURSE_URL = `${BASE_URL}`;

window.onload = () => {
    renderItemsList(films, onEditItem, onRemoveItem);
}

const baseRequest = async ({ urlPath = "", method = "GET", body = null }) => {
    try {
        const reqParams = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (body) {
            reqParams.body = JSON.stringify(body);
        }

        return await fetch(`${RESOURSE_URL}${urlPath}`, reqParams);
    } catch (error) {
        console.error("HTTP ERROR: ", error);
    }
};


const getAllFilms = async () => {
    const rawResponse = await baseRequest({ method: "GET" });

    return await rawResponse.json();
};
const getAllFilmsDuration = async () => {
    const rawResponse = await baseRequest({ method: "GET" });
    const result = await rawResponse.json()
    let data = [];
    let sum = 0;
    const Duration = result.reduce((acc, item) => {
        const { duration } = item;
        acc.push({ 'duration': duration })
        return acc
    }, [])
    for (let i = 0; i < Duration.length; i++) {
        data.push(Duration[i].duration)
        sum = sum + data[i];
    }
    return sum
};

const renderItemsList = (items, onEditItem, onRemoveItem) => {
    itemsContainer.innerHTML = "";

    for (const item of items) {
        addItemToPage(item, onEditItem, onRemoveItem);
    }
};

const updateFilm = (id, body) =>
    baseRequest({ urlPath: `/${id}`, method: "PATCH", body });

const deleteFilm = (id) =>
    baseRequest({ urlPath: `/${id}`, method: "DELETE" });


const getInputValues = () => {
    return {
        title: titleinput.value,
        description: descriptionArea.value,
        comments: commentsinput.value,
        duration: Durationinput.value
    };
};

const clearInputs = () => {
    titleinput.value = "";

    descriptionArea.value = "";

    commentsinput.value = "";

    Durationinput.value = "";
};

const onEditItem = async (e) => {
    const itemId = e.target.id.replace(EDIT_BUTTON_PREFIX, "");

    await updateFilm(itemId, getInputValues())

    clearInputs();

    refetchAllFilms();
};

const onRemoveItem = (id) => deleteFilm(id).then((res) => {
    if (res.ok) {
        refetchAllFilms();
    } else {
        console.error(res.ok);
    }
});


const refetchAllFilms = async () => {
    const allFilms = await getAllFilms();

    films = allFilms;

    renderItemsList(films, onEditItem, onRemoveItem);
};

const postFilm = (body) => baseRequest({ method: "POST", body });


submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    fetch(BASE_URL).then(res => res.json());
    const { title, description, comments, duration } = getInputValues();

    FormInputs.forEach((input, index) => {
        if(input.value === ''){
            alert(`Your input is empty. Type somethink to input number: ${index+1}`)
        }
    })

    clearInputs();

    postFilm({
        title,
        description,
        comments,
        duration
    }).then(refetchAllFilms);
});

findButton.addEventListener("click", () => {
    const foundFilms = films.filter(
        (film) => film.title.search(findInput.value) !== -1
    );

    renderItemsList(foundFilms, onEditItem, onRemoveItem);
});

cancelFindButton.addEventListener("click", () => {
    renderItemsList(films, onEditItem, onRemoveItem);

    findInput.value = "";
});

const itemTemplate = ({ id, title, description, comments, duration }) => `
<div class="Card" id="${id}">
    <img src="https://via.placeholder.com/235x140" />
    <div class="Card__content">
        <h2>${title}</h2>
        <p class="Card__description">${description}</p>
        <span>Comments: ${comments}</span>
        <span>Duration: ${duration}</span>
        <div class="Card__edit__btns">
            <div id="${EDIT_BUTTON_PREFIX}${id}" class="Card__edit__btns__edit">Edit</div>
            <div class="Card__edit__btns__remove" id="delete_btn" onclick="Delete_element('${id}')">Remove</div>
        </div>
    </div>
</div>`;
function Delete_element(id) {
    onRemoveItem(id);

}
const addItemToPage = ({ _id: id, title, description, comments, duration }, onEditItem, onRemoveItem) => {
    itemsContainer.insertAdjacentHTML(
        "afterbegin",
        itemTemplate({ id, title, description, comments, duration })
    );

    const editButton = document.getElementById(`${EDIT_BUTTON_PREFIX}${id}`);


    editButton.addEventListener("click", onEditItem);

};

Count.addEventListener('click', async () => {

    const totalduration = await getAllFilmsDuration();
    document.getElementById("TotalDuration").innerHTML = `${totalduration}`;
});

Sort.addEventListener('click', () => {
    const sortedFilms = films.sort((a, b) => {
        if (a.comments > b.comments) {
            return 1;
        }
        if (a.comments < b.comments) {
            return -1;
        }
        // a должно быть равным b
        return 0;
    })
    renderItemsList(sortedFilms, onEditItem, onRemoveItem);
})



refetchAllFilms();