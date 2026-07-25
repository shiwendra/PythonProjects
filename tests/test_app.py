import unittest
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app import app, passwords


class PasswordManagerTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        passwords.clear()

    def test_update_password(self):
        create_response = self.client.post(
            '/api/passwords',
            json={
                'site': 'example.com',
                'username': 'user',
                'password': 'oldpass'
            }
        )
        self.assertEqual(create_response.status_code, 201)
        entry_id = create_response.get_json()['id']

        update_response = self.client.put(
            f'/api/passwords/{entry_id}',
            json={
                'site': 'example.com',
                'username': 'user',
                'password': 'newpass'
            }
        )

        self.assertEqual(update_response.status_code, 200)
        updated_entry = update_response.get_json()
        self.assertEqual(updated_entry['password'], 'newpass')
        self.assertEqual(updated_entry['site'], 'example.com')


if __name__ == '__main__':
    unittest.main()
