function iniciarApp() {

    const selectCategorias = document.querySelector('#categorias')
    const resultado = document.querySelector('#resultado')

    if (selectCategorias) {
        selectCategorias.addEventListener('change', seleccionarCategoria)
        obtenerCategorias();
    }

    //agregamos index favoritos

    const favoritosDiv = document.querySelector('.favoritos')

    if (favoritosDiv) {
        obtenerFavoritos()
    }

    const modal = new bootstrap.Modal('#modal', {})


    function obtenerCategorias() {

        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(result => {
                mostrarCategorias(result.categories)
            })
    }

    function mostrarCategorias(categorias = []) {

        categorias.forEach(categoria => {

            const { strCategory } = categoria
            const option = document.createElement('OPTION')
            option.value = strCategory
            option.textContent = strCategory


            selectCategorias.appendChild(option)
        })
    }

    function seleccionarCategoria(e) {

        const categoria = e.target.value

        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`

        fetch(url)
            .then(response => response.json())
            .then(result => mostrarRecetas(result.meals))

    }

    function mostrarRecetas(recetas = []) {

        limpiarHTML(resultado)

        const heading = document.createElement('H2')
        heading.classList.add('text-center', 'text-black', 'my-5')
        heading.textContent = recetas.length ? 'Resultados' : 'No hay reswultados'
        resultado.appendChild(heading)

        //iterar en los resultados

        recetas.forEach(receta => {

            const { idMeal, strMeal, strMealThumb } = receta


            const recetaContenedor = document.createElement('DIV');

            recetaContenedor.classList.add('col-md-4')

            const recetaCard = document.createElement('DIV')
            recetaCard.classList.add('card', 'mb-4')


            const recetaImagen = document.createElement('IMG')
            recetaImagen.classList.add('card-img-top')

            recetaImagen.alt = `Imagen de ${strMeal ?? receta.titulo}`
            recetaImagen.src = strMealThumb ?? receta.img


            const recetaCardBody = document.createElement('DIV')
            recetaCardBody.classList.add('card-body')

            const recetaHeading = document.createElement('H3')
            recetaHeading.classList.add('card-title', 'mb-3')
            recetaHeading.textContent = strMeal ?? receta.titulo

            const recetaButton = document.createElement('BUTTON')
            recetaButton.classList.add('btn', 'btn-danger', 'w-100')
            recetaButton.textContent = 'Ver receta'
            //recetaButton.dataset.bsTarget = "#modal";
            //recetaButton.dataset.bsToggle = "modal"

            recetaButton.onclick = function () {
                seleccionarReceta(idMeal ?? receta.id)
            }

            //inyecto el codigo en el HTML

            recetaCardBody.appendChild(recetaHeading)
            recetaCardBody.appendChild(recetaButton)

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody)

            recetaContenedor.appendChild(recetaCard)

            resultado.appendChild(recetaContenedor)
        })
    }

    function seleccionarReceta(id) {

        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(response => response.json())
            .then(result => mostrarRecetaModal(result.meals[0]))

    }

    function mostrarRecetaModal(receta) {

        const { idMeal, strInstructions, strMeal, strMealThumb, strYoutube } = receta

        //añadir contenido a la modal
        const modalTitle = document.querySelector('.modal .modal-title')
        const modalBody = document.querySelector('.modal .modal-body')

        modalTitle.textContent = strMeal
        modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
        <h3 class="my-3">Intrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y cantidades</h3>
        <p>Receta: <a href="${strYoutube}" target="_blank">${strYoutube}</a></p>
        `;

        const listGroup = document.createElement('UL')
        listGroup.classList.add('list-group')

        //mostrar cantidades e ingredientes

        for (i = 1; i < 10; i++) {

            if (receta[`strIngredient${i}`]) {

                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]

                const ingredienteLI = document.createElement('LI')
                ingredienteLI.classList.add('list-group-item')
                ingredienteLI.textContent = `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredienteLI)

            }
        }

        modalBody.appendChild(listGroup)

        const modalFooter = document.querySelector('.modal-footer')
        limpiarHTML(modalFooter)

        //Botones de cerrar y favoritos

        const btnFavorito = document.createElement('BUTTON')
        btnFavorito.classList.add('btn', 'btn-danger', 'col')
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar favorito' : 'Guardar Favorito'

        //localStorage

        btnFavorito.onclick = function () {

            if (existeStorage(idMeal)) {
                eliminarFavorito(idMeal)
                btnFavorito.textContent = 'Guardar Favorito'
                mostrarToast('Eliminado correctamente')
                return;
            }

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            })
            btnFavorito.textContent = 'Borrar Favorito'
            mostrarToast('Agregado correctamente')

        }

        const btnCerrarModal = document.createElement('BUTTON')
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col')
        btnCerrarModal.textContent = "Cerrar"
        btnCerrarModal.onclick = function () {
            modal.hide()
        }

        modalFooter.appendChild(btnFavorito)
        modalFooter.appendChild(btnCerrarModal)


        //muestro el modal

        modal.show()

    }

    function agregarFavorito(receta) {

        const favorito = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favorito, receta]))
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id)
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))

        obtenerFavoritos();
    }

    function existeStorage(id) {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id)

    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast')
        const toastBody = document.querySelector('.toast-body')
        const toast = new bootstrap.Toast(toastDiv)
        toastBody.textContent = mensaje
        toast.show()
    }

    function obtenerFavoritos() {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];

        if (favoritos.length) {

            mostrarRecetas(favoritos)

            return;
        }

        const noFavoritos = document.createElement('P')
        noFavoritos.textContent = 'No hay favoritos'
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5')
        favoritosDiv.appendChild(noFavoritos)


    }

    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp);