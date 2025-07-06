import asyncio
from sqlalchemy import select
from app.core.security import get_password_hash
from app.models.auth import User
from app.db.session import AsyncSessionLocal

async def create_admin():
    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        query = select(User).where(User.email == "bamn@gmail.com")
        result = await session.execute(query)
        admin = result.scalar_one_or_none()
        
        if admin:
            print("Admin user already exists!")
            return
        
        # Create admin user with just the fields that exist in the table
        admin = User(
            email="bamn@gmail.com",
            hashed_password=get_password_hash("@admin122"),
            full_name="BAMN Admin",
            role="admin"
        )
        
        session.add(admin)
        await session.commit()
        print("Admin user created successfully!")

if __name__ == "__main__":
    asyncio.run(create_admin()) 