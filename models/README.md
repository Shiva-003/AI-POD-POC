# MODELS

#### How to run the project ?

1. Create and activate a virtual environment

    On macOS/Linux:
    ```
    python3 -m venv env
    source env/bin/activate
    ```

    On Windows:
    ```
    python -m venv env
    .\env\Scripts\activate
    ```

2. Install required packages

    ```
    pip install -r requirements.txt
    ```

3. Run the FastAPI app

    ```
    fastapi run main.py
    ```

    Addtionally, Add the --reload flag to enable hot reload during development:

    ```
    fastapi run main.py --reload
    ```