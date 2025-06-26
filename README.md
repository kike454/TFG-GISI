# GREMA APP

![CI/CD](https://github.com/kike454/TFG-GISI/actions/workflows/deploy.yml/badge.svg)

## Descripción

Trabajo de Fin de Grado centrado en el desarrollo y despliegue de una API REST para la gestión de reservas de libros mediante membresía.  
Incluye autenticación, gestión de pagos y notificaciones por correo.

## Temática

Migración de base de datos de **MySQL** a **PostgreSQL** con despliegue en **AWS EC2** utilizando arquitectura de **tres capas** y despliegue continuo (**CD**) mediante **GitHub Actions**.

## Tecnologías utilizadas

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />&nbsp;
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />&nbsp;
  <img alt="Bootstrap" src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" />&nbsp;
  <img alt="Nodemailer" src="https://img.shields.io/badge/Nodemailer-FF6C37?style=for-the-badge&logo=nodemailer&logoColor=white" />&nbsp;
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />&nbsp;
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

## Instalación y despliegue local

## Prerrequisitos

Tener instalado **[Docker](https://www.docker.com/)** en el equipo.


### Linux

1. Clona el repositorio y entra en la carpeta del proyecto:

    ```bash
    git clone https://github.com/kike454/TFG-GISI.git
    cd TFG-GISI
    ```

2. En una terminal, ejecuta los siguientes comandos para crear el fichero de **variables de entorno**:

    ```bash
    cp backend/.env.example backend/.env
    ```
3. Ahora, lanza la aplicación con **Docker**:

    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh

    ```

4. Comprueba las versiones de Docker y docker compose:

    ```
    docker --version
    docker compose version
    ```

5. Arranca los contenedores en segundo plano:

    ```
    sudo docker compose up -d 
    ```
6. Para parar los contenedores previamente lanzados:

    ```
    sudo docker compose down
    ```




---

**Enrique Collado Muñoz**  
Grado en Ingeniería de Sistemas de la Información  
Universidad CEU San Pablo

---

```text
MIT License

Copyright (c) 2025 Enrique Collado Muñoz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
