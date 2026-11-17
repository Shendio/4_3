(function () {
  const categoriesBtn = document.getElementById('categoriesBtn')
  const categoriesStatus = document.getElementById('categoriesStatus')
  const categoriesList = document.getElementById('categoriesList')

  const categorySelect = document.getElementById('categorySelect')
  const jokeBtn = document.getElementById('jokeBtn')
  const jokeStatus = document.getElementById('jokeStatus')
  const jokeBox = document.getElementById('jokeBox')
  const jokeText = document.getElementById('jokeText')
  const jokeResponse = document.getElementById('jokeResponse')

  function apiBase() {
    if (!window.API_BASE) {
      throw new Error('Brak API_BASE w config.js.')
    }
    return window.API_BASE.replace(/\/$/, '')
  }

  function networkErrorMessage(error) {
    if (error.name === 'TypeError') {
      return 'Nie udało się połączyć z API (uruchom backend i sprawdź CORS).'
    }
    return error.message || 'Wystąpił błąd.'
  }

  function fillCategorySelect(categories) {
    categorySelect.innerHTML = ''

    if (!categories.length) {
      const option = document.createElement('option')
      option.value = ''
      option.textContent = '— brak kategorii —'
      categorySelect.appendChild(option)
      categorySelect.disabled = true
      jokeBtn.disabled = true
      return
    }

    categories.forEach(function (name) {
      const option = document.createElement('option')
      option.value = name
      option.textContent = name
      categorySelect.appendChild(option)
    })

    categorySelect.disabled = false
    jokeBtn.disabled = false
  }

  function renderCategories(categories) {
    categoriesList.innerHTML = ''
    categories.forEach(function (name) {
      const li = document.createElement('li')
      li.textContent = name
      categoriesList.appendChild(li)
    })
  }

  async function loadCategories() {
    categoriesStatus.textContent = 'Pobieranie kategorii…'
    categoriesList.innerHTML = ''
    categoriesBtn.disabled = true

    try {
      const base = apiBase()
      const res = await fetch(base + '/jokebook/categories')
      const data = await res.json()

      const categories = data.categories || []
      if (!categories.length) {
        throw new Error('API nie zwróciło kategorii.')
      }

      renderCategories(categories)
      fillCategorySelect(categories)
      categoriesStatus.textContent = 'Pobrano ' + categories.length + ' kategorii.'
    } catch (error) {
      categoriesStatus.textContent = networkErrorMessage(error)
      fillCategorySelect([])
    } finally {
      categoriesBtn.disabled = false
    }
  }

  async function loadRandomJoke() {
    const category = categorySelect.value
    if (!category) {
      jokeStatus.textContent = 'Wybierz kategorię.'
      return
    }

    jokeStatus.textContent = 'Pobieranie żartu…'
    jokeBox.hidden = true
    jokeBtn.disabled = true

    try {
      const base = apiBase()
      const res = await fetch(
        base + '/jokebook/joke/' + encodeURIComponent(category)
      )
      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      jokeText.textContent = data.joke
      jokeResponse.textContent = data.response
      jokeBox.hidden = false
      jokeStatus.textContent = 'Kategoria: ' + category
    } catch (error) {
      jokeBox.hidden = true
      jokeStatus.textContent = networkErrorMessage(error)
    } finally {
      jokeBtn.disabled = categorySelect.disabled
    }
  }

  categoriesBtn.addEventListener('click', loadCategories)
  jokeBtn.addEventListener('click', loadRandomJoke)
})()
