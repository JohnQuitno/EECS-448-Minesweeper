from Board import Board
import json


class Executive:
    """
    Runs the game by calling Board methods
    """

    # Define member variables
    m_board = Board(1, 1, 1)
    m_userID = 0

    def __init__(self, rows, cols, numMines, userID):
        """
        Initialize Executive
        Pre:
            none
        Post:
            member variables set to user specified values
        Args:
            int rows, int cols, int numMines, int userID
        Returns:
            none
        Raise:
            RuntimeError if board size is invalid or if invalid number of mines
        """

        if rows < 2 or cols < 2:
            raise RuntimeError('Invalid board size')
        if numMines < 1 or numMines > rows * cols - 1:
            raise RuntimeError('Invalid number of mines')

        self.m_board = Board(rows, cols, numMines)
        self.m_userID = userID
        return

    def reset(self, rows, cols, numMines, userID):

        if rows < 2 or cols < 2:
            raise RuntimeError('Invalid board size')
        if numMines < 1 or numMines > rows * cols - 1:
            raise RuntimeError('Invalid number of mines')

        self.m_board = Board(rows, cols, numMines)
        self.m_userID = userID

        return

    def leftClick(self, row, col):
        """
        Handles left click event - clicking on a new space
        Pre:
            valid input for row and col
        Post:
            Modifies board to unhide selected spot (and related)
        Args:
            int row, int col
        Returns:
            returns false is user loses game
        """

        self.m_board.selectSpace(row, col)

    def rightClick(self, row, col):
        """
        Handles right click event - toggling flag
        Pre:
            valid row and col input
        Post:
            toggles flag and determines if user has won
        Args:
            int rows, int cols
        Returns:
            returns -1 if user is out of flags
            returns 0 if flag was successfully planted
            returns 1 if user wins (all mines flagged)
        """

        self.m_board.toggleFlagSpace(row, col)


    def getUserID(self):
        """
        Gets userID for Executive instance
        Pre:
            none
        Post:
            none
        Args:
            none
        Returns:
            int userID
        """

        return self.m_userID

    def getJson(self, isCheatMode):
        """
        Pass through json
        Pre:
            none
        Post:
            none
        Args:
            none
        Returns:
            returns json string of board depending on if cheatMode
        """
        if not isCheatMode:
            return self.m_board.boardToJson()
        else:
            return self.m_board.cheatModeBoardToJson()
