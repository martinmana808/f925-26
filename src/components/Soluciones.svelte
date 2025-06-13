<script>
  // You can add any necessary imports or logic here
</script>

<div class="soluciones__list-overflow scroll-container">
  <ul class="soluciones__list flex list-reset scroll-content">
    
    <li class="soluciones__item" data-category="comercios">
      <div class="soluciones__card">
        <!-- Front of card -->
        <div class="soluciones__front">
          <button type="button" class="soluciones__btn">
            <figure class="soluciones__img">
              <img class="object-fit image-bg" src="/images/soluciones-comercios.webp" alt="Comercios">
            </figure>
            <h3 class="text-heading-block">Comercios</h3>
          </button>
        </div>
        <!-- Back of card -->
        <div class="soluciones__back">
          <div class="soluciones__content">
            <!-- Modal content for Comercios goes here -->
            <h3>Comercios</h3>
            <p>Content that was previously in the modal...</p>
          </div>
        </div>
      </div>
    </li>

    <li class="soluciones__item" data-category="hospitales">
      <div class="soluciones__card">
        <div class="soluciones__front">
          <button type="button" class="soluciones__btn">
            <figure class="soluciones__img">
              <img class="object-fit image-bg" src="/images/soluciones-laboratorios.webp" alt="Hospitales">
            </figure>
            <h3 class="text-heading-block">Hospitales</h3>
          </button>
        </div>
        <div class="soluciones__back">
          <div class="soluciones__content">
            <!-- Modal content for Hospitales goes here -->
            <h3>Hospitales</h3>
            <p>Content that was previously in the modal...</p>
          </div>
        </div>
      </div>
    </li>

    <li class="soluciones__item" data-category="aeropuertos">
      <div class="soluciones__card">
        <div class="soluciones__front">
          <button type="button" class="soluciones__btn">
            <figure class="soluciones__img">
              <img class="object-fit image-bg" src="/images/soluciones-aeropuertos.webp" alt="Aeropuertos">
            </figure>
            <h3 class="text-heading-block">Aeropuertos</h3>
          </button>
        </div>
        <div class="soluciones__back">
          <div class="soluciones__content">
            <!-- Modal content for Aeropuertos goes here -->
            <h3>Aeropuertos</h3>
            <p>Content that was previously in the modal...</p>
          </div>
        </div>
      </div>
    </li>

    <li class="soluciones__item" data-category="industrias">
      <div class="soluciones__card">
        <div class="soluciones__front">
          <button type="button" class="soluciones__btn">
            <figure class="soluciones__img">
              <img class="object-fit image-bg" src="/images/soluciones-industrias.webp" alt="Industrias">
            </figure>
            <h3 class="text-heading-block">Industrias</h3>
          </button>
        </div>
        <div class="soluciones__back">
          <div class="soluciones__content">
            <!-- Modal content for Industrias goes here -->
            <h3>Industrias</h3>
            <p>Content that was previously in the modal...</p>
          </div>
        </div>
      </div>
    </li>

    <li class="soluciones__item" data-category="edificios">
      <div class="soluciones__card">
        <div class="soluciones__front">
          <button type="button" class="soluciones__btn">
            <figure class="soluciones__img">
              <img class="object-fit image-bg" src="/images/soluciones-servidores.webp" alt="Edificios">
            </figure>
            <h3 class="text-heading-block">Edificios</h3>
          </button>
        </div>
        <div class="soluciones__back">
          <div class="soluciones__content">
            <!-- Modal content for Edificios goes here -->
            <h3>Edificios</h3>
            <p>Content that was previously in the modal...</p>
          </div>
        </div>
      </div>
    </li>

    <li class="soluciones__item" data-category="bancos">
      <div class="soluciones__card">
        <div class="soluciones__front">
          <button type="button" class="soluciones__btn">
            <figure class="soluciones__img">
              <img class="object-fit image-bg" src="/images/soluciones-bancos.webp" alt="Bancos">
            </figure>
            <h3 class="text-heading-block">Bancos</h3>
          </button>
        </div>
        <div class="soluciones__back">
          <div class="soluciones__content">
            <!-- Modal content for Bancos goes here -->
            <h3>Bancos</h3>
            <p>Content that was previously in the modal...</p>
          </div>
        </div>
      </div>
    </li>

    <li class="soluciones__item" data-category="hoteles">
      <div class="soluciones__card">
        <div class="soluciones__front">
          <button type="button" class="soluciones__btn">
            <figure class="soluciones__img">
              <img class="object-fit image-bg" src="/images/soluciones-hoteles.webp" alt="Hoteles">
            </figure>
            <h3 class="text-heading-block">Hoteles</h3>
          </button>
        </div>
        <div class="soluciones__back">
          <div class="soluciones__content">
            <!-- Modal content for Hoteles goes here -->
            <h3>Hoteles</h3>
            <p>Content that was previously in the modal...</p>
          </div>
        </div>
      </div>
    </li>

    <li class="soluciones__item" data-category="empty">
    </li>

  </ul>
</div>

<style>
  .soluciones__card {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .soluciones__front,
  .soluciones__back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
  }

  .soluciones__back {
    display: none;
    background: #fff;
    padding: 1rem;
  }

  .soluciones__item:hover .soluciones__front {
    display: none;
  }

  .soluciones__item:hover .soluciones__back {
    display: block;
  }

  .soluciones__content {
    height: 100%;
    overflow-y: auto;
  }
</style> 
