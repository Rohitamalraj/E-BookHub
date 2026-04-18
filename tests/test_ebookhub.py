import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class EBookHubTests(unittest.TestCase):
    def setUp(self):
        # Configure Chrome options
        options = webdriver.ChromeOptions()
        # Uncomment the following line to run in headless mode (no visible browser UI)
        # options.add_argument('--headless') 
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()
        self.base_url = "https://e-book-hub.vercel.app"

    def test_login_and_read_book(self):
        driver = self.driver
        print("Navigating to login page...")
        driver.get(f"{self.base_url}/login")

        wait = WebDriverWait(driver, 10)
        
        # 1. Wait for form fields to load
        print("Waiting for login form...")
        email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        password_input = driver.find_element(By.XPATH, "//input[@type='password']")
        
        # 2. Enter credentials
        print("Entering credentials...")
        email_input.send_keys("rohitamalraj.27csb@licet.ac.in")
        password_input.send_keys("Rohit!2006")
        
        # 3. Submit login
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # 4. Watch for successful redirect to /books
        print("Waiting for redirect to home/books page...")
        try:
            wait.until(EC.url_contains("/books"))
            print("Login successful! Redirected to books.")
        except TimeoutException:
            self.fail("Login failed: Did not redirect to /books within time limit.")

        # 5. Go to My Library
        print("Navigating to My Library...")
        driver.get(f"{self.base_url}/library")

        # 6. Wait for "READ NOW" button to appear (indicating library books loaded)
        try:
            # Finding the link or button to read a book
            print("Looking for a book to read...")
            read_now_element = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/reader/')]")))
            read_now_element.click()
            print("Clicked 'READ NOW' on the first available book.")
        except TimeoutException:
            self.fail("Library failed to load or no books are available to read.")

        # 7. Confirm successful navigation to the reader page
        wait.until(EC.url_contains("/reader/"))
        print(f"Successfully loaded the book reader! Current URL: {driver.current_url}")
        
        # Small delay to observe the loaded book visually before test teardown
        time.sleep(3)

    def tearDown(self):
        # Close the browser once the test completes
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    unittest.main()
