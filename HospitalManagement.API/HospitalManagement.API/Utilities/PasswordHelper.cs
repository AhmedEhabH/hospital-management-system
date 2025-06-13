using BCrypt.Net;

namespace HospitalManagement.API.Utilities
{
    public class PasswordHelper
    {
        /// <summary>
        /// Hashes a password using BCrypt.
        /// </summary>
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
        }

        /// <summary>
        /// Verifies a password against its hash.
        /// </summary>
        public static bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
