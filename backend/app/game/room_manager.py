STUDY_ROOM = {
    "id": "study",
    "name": "The Abandoned Study",
    "description": (
        "A forgotten study covered in dust. "
        "Moonlight enters through a tall window. "
        "An old grandfather clock stands against the wall, "
        "while a painting, bookshelf, diary, locked drawer, "
        "safe, telephone and exit door surround the room."
    ),
    "objects": [
        {
            "id": "grandfather_clock",
            "name": "Grandfather Clock",
            "description": "An old wooden clock that has stopped at a strange time.",
        },
        {
            "id": "old_painting",
            "name": "Old Painting",
            "description": "A faded painting of a mysterious woman standing in the study.",
        },
        {
            "id": "diary",
            "name": "Old Diary",
            "description": "A leather-bound diary covered in dust.",
        },
        {
            "id": "bookshelf",
            "name": "Bookshelf",
            "description": "A large bookshelf filled with old books.",
        },
        {
            "id": "locked_drawer",
            "name": "Locked Drawer",
            "description": "A small wooden drawer with a brass lock.",
        },
        {
            "id": "safe",
            "name": "Old Safe",
            "description": "A heavy metal safe with a combination lock.",
        },
        {
            "id": "telephone",
            "name": "Old Telephone",
            "description": "An antique telephone covered in dust.",
        },
        {
            "id": "exit_door",
            "name": "Exit Door",
            "description": "A heavy wooden door leading out of the study.",
        },
    ],
}


def get_room(room_id: str):

    if room_id == "study":
        return STUDY_ROOM

    return None