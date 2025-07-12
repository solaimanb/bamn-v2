"""
Google OAuth verification utilities.
"""
from google.oauth2 import id_token
from google.auth.transport.requests import Request
from typing import Dict, Any
from fastapi import HTTPException, status
import time
import logging

from app.core.config import settings

# Set up logging
logger = logging.getLogger(__name__)

class GoogleOAuthError(Exception):
    """Custom exception for Google OAuth errors"""
    pass

def validate_google_configuration() -> None:
    """
    Validate that Google OAuth is properly configured
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise GoogleOAuthError("Google OAuth client ID is not configured")
    if not settings.GOOGLE_CLIENT_SECRET:
        raise GoogleOAuthError("Google OAuth client secret is not configured")
    if not settings.GOOGLE_REDIRECT_URI:
        raise GoogleOAuthError("Google OAuth redirect URI is not configured")

def verify_google_token(token: str) -> Dict[str, Any]:
    """
    Verify Google OAuth token and return user info.
    
    Args:
        token: Google OAuth ID token
        
    Returns:
        Dict containing user information from Google
        
    Raises:
        HTTPException: If token is invalid or verification fails
    """
    try:
        # Validate configuration first
        validate_google_configuration()
        
        # Log token length for debugging
        logger.info(f"Verifying Google token of length: {len(token)}")
        
        # Create request object for token verification
        request = Request()
        
        # Verify the token
        logger.debug("Attempting to verify Google token...")
        idinfo = id_token.verify_oauth2_token(
            token,
            request,
            settings.GOOGLE_CLIENT_ID
        )
        logger.info("Successfully verified Google token")
        
        # Validate token issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            logger.error(f"Invalid token issuer: {idinfo['iss']}")
            raise ValueError('Invalid token issuer')
            
        # Validate token audience
        if idinfo['aud'] != settings.GOOGLE_CLIENT_ID:
            logger.error(f"Token audience mismatch. Expected: {settings.GOOGLE_CLIENT_ID}, Got: {idinfo['aud']}")
            raise ValueError('Invalid token audience')
            
        # Check if token is expired using token's exp claim
        current_time = int(time.time())
        if idinfo.get('exp', 0) < current_time:
            logger.error(f"Token expired. Expiration: {idinfo.get('exp')}, Current time: {current_time}")
            raise ValueError('Token has expired')
            
        logger.info(f"Successfully validated Google token for email: {idinfo.get('email')}")
        return {
            'email': idinfo['email'],
            'email_verified': idinfo.get('email_verified', False),
            'google_id': idinfo['sub'],
            'full_name': idinfo.get('name', ''),
            'given_name': idinfo.get('given_name', ''),
            'family_name': idinfo.get('family_name', ''),
            'picture': idinfo.get('picture', None),
            'locale': idinfo.get('locale', None)
        }
        
    except ValueError as e:
        logger.error(f"Invalid Google token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Google OAuth verification failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth verification failed: {str(e)}"
        ) 