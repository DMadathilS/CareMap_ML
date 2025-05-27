# Selenium ChromeDriver Setup Guide

A concise, step-by-step guide to prepare your environment for Selenium test automation with Google Chrome in headless mode.

---

## 1. Download and Install ChromeDriver

1. **Find your Chrome version**

   - Open Google Chrome, go to `chrome://settings/help`, and note the version number (e.g., `114.0.5735.199`).

2. **Download ChromeDriver**

   - Visit the [ChromeDriver downloads page](https://chromedriver.chromium.org/downloads).
   - Select the release that exactly matches your Chrome version.
   - Download the ZIP file for your operating system.

3. **Install ChromeDriver**

   - Extract the archive.
   - Move the `chromedriver` (or `chromedriver.exe` on Windows) file to a location on your system `PATH`, or place it in your project folder.
   - Verify installation by running in your terminal:

     ```bash
     chromedriver --version
     ```

---

## 2. Create a Python Virtual Environment

1. **Initialize the environment**

   ```bash
   python3 -m venv venv        # Linux/macOS
   python -m venv venv         # Windows
   ```

2. **Activate the environment**

   - **macOS/Linux:**

     ```bash
     source venv/bin/activate
     ```

   - **Windows (PowerShell):**

     ```powershell
     .\venv\Scripts\Activate.ps1
     ```

   - **Windows (CMD):**

     ```cmd
     venv\Scripts\activate
     ```

---

## 3. Install Required Library

With your virtual environment activated, install Selenium:

```bash
pip install selenium
```

---

## 4. Chrome Options Explained

When launching Chrome via Selenium, you can pass command-line options:

- **`--headless`**

  - Runs Chrome without a visible UI. Ideal for automated testing and CI pipelines where no graphical display is needed.

- **`--disable-gpu`**

  - Disables GPU hardware acceleration. Required on some platforms (notably Windows) to prevent rendering issues in headless mode.

You can combine these flags to run Chrome completely headless and stable:

```
opts.add_argument("--headless")
opts.add_argument("--disable-gpu")
```

---

## 5. Running Your Selenium Scripts

1. Ensure your virtual environment is activated.
2. Place your Python script (e.g., `test_script.py`) in the project folder alongside `chromedriver` (if not on `PATH`).
3. Run the script:

   ```bash
   python test_script.py
   ```

This will launch Chrome in headless mode, execute your Selenium commands, and exit once complete.

---

## Additional Tips

- If `chromedriver` is not found, specify its path when creating the driver:

  ```python
  webdriver.Chrome(executable_path='/path/to/chromedriver', options=opts)
  ```

- You may add other Chrome flags as needed. See the full [list of Chrome switches](https://peter.sh/experiments/chromium-command-line-switches/) for more.

---
