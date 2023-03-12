<script setup lang="ts"></script>

<template>
  <div class="home-container d-flex flex-column align-items-center flex-fill">
    <div class="logo d-flex justify-content-center w-100">
      <img class="logo" src="@/assets/images/buildconverse.png" />
    </div>
    <h1 class="title mb-20">Connectez-vous avec vos amis et vos communautés</h1>
    <section class="features d-flex flex-column">
      <h3>Fonctionnalités</h3>
      <ul class="d-flex justify-content-center">
        <li>
          Créer une communauté
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 21 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z"
            />
          </svg>
        </li>
        <li>
          Messagerie privé
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64h96v80c0 6.1 3.4 11.6 8.8 14.3s11.9 2.1 16.8-1.5L309.3 416H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64z"
            />
          </svg>
        </li>
        <li>
          Salons de discussions
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192h42.7c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0H21.3C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7h42.7C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3H405.3zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352H378.7C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7H154.7c-14.7 0-26.7-11.9-26.7-26.7z"
            />
          </svg>
        </li>
        <li>
          Ajouter des amis
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
            />
          </svg>
        </li>
        <!-- Ajoutez d'autres fonctionnalités ici -->
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  width: 0;
  padding: 0 4rem;
  position: relative;
  background: var(--primary-4);
  box-shadow: inset 0 0 5px 0 #a8a8a8;

  .logo {
    margin: 15px 0;
    img {
      width: 300px;
    }
  }

  .title {
    text-align: center;
    font-size: 2rem;
    color: var(--primary-2);
    text-transform: uppercase;
    letter-spacing: 6px;
  }
  .description {
    font-size: 1.5rem;
    text-align: center;
    color: var(--primary-1);
  }

  .features {
    width: 80%;
    background-color: #ffffff;
    padding: 80px 0;
    text-align: center;
    border-radius: 10px;

    h3 {
      font-size: 36px;
      color: var(--text-color);
      margin-top: 0;
      font-weight: normal;
    }

    li {
      text-align: center;
      color: var(--text-color);
      min-height: 80px;
      width: 225px;
      margin: 20px;
      display: flex;
      font-weight: 500;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      border-radius: 8px;
      box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;

      svg {
        width: 30px;

        fill: var(--primary-2);
      }
    }
  }
}
</style>
