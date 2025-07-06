import asyncio
from sqlalchemy import text
from app.db.session import engine

async def reset_migrations():
    async with engine.connect() as conn:
        await conn.execute(text('DROP TABLE IF EXISTS alembic_version;'))
        await conn.commit()
        print("Successfully reset migrations!")

if __name__ == "__main__":
    asyncio.run(reset_migrations()) 