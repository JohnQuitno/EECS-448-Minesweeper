from BoardSpace import BoardSpace, getSpace, showSpace
import random
import json


class Board:
    """
    Board class contains the 2D array of BoardSpaces to hold game info
    Handles all things related to the game and is called by executive
    """

    # initializes the board
    def __init__(self, rows, cols, mines):
        """
        Initializes Board object
        Pre:
            valid parameters
        Post:
            Initializes member variables based on user input
        Args:
            int numRows, int numCols, int numMines
        Returns:
            No return
        """

        self.m_rows = rows
        self.m_cols = cols
        self.m_mines = mines
        self.m_revealed = 0
        self.m_board = []
        self.status = ""
        for r in range(0, rows):
            self.m_board.append([])
            for c in range(0, cols):
                self.m_board[r].append(BoardSpace())

        # init
        self.placeBombs()
        self.calculateNearby()

    # places all mines around the first space stepped on
    def placeBombs(self):
        """
        Places mines randomly around map
        Pre:
            valid x and y coordinates, numMines
        Post:
            mines set randomly around map
        Args:
            int xpos (row), int ypos (column)
        Returns:
            none
        """

        # initializes a certian number of mines
        for x in range(0, self.m_mines):
            while True:
                row = random.randint(0,self.m_rows-1)
                col = random.randint(0,self.m_cols-1)
                if not self.m_board[row][col].isMine:
                    break
            self.m_board[row][col].isMine = True

    def placeBomb(self):
        """
        Places a random mine
        Pre:
            valid x and y coordinates, numMines
        Post:
            mines set randomly around map
        Args:
            int xpos (row), int ypos (column)
        Returns:
            none
        """

        # initializes a certian number of mines

        while True:
            row = random.randint(0,self.m_rows-1)
            col = random.randint(0,self.m_cols-1)
            if not self.m_board[row][col].isMine:
                self.m_board[row][col].isMine = True
                break

    def calculateNearby(self):
        """
        Calculates quantity of nearby mines for all mines
        Pre:
            initialized boardspaces
        Post:
            each boardspace in board object now knows have many mines surround it
        Args:
            none
        Returns:
            none
        """

        for i in range(0, self.m_rows):
            for j in range(0, self.m_cols):
                if not self.m_board[i][j].isMine:
                    self.m_board[i][j].numMines = self.calcAround(i, j)

    def calcAround(self, xpos, ypos):
        """
        Determines nearby quantity of mines for a single board space
        Pre:
            valid x and y coordinates
        Post:
            individual boardspace knows how many mines surround it
        Args:
            int xpos (row), int ypos (column)
        Returns:
            integer representing nearby mine count
        """

        count = 0
        for x in range(max(xpos - 1, 0), min(xpos + 2, self.m_rows)):
            for y in range(max(ypos - 1, 0), min(ypos + 2, self.m_cols)):
                if (x != xpos or y != ypos) and self.m_board[x][y].isMine:
                    count += 1

        return count

    def recUnhide(self, xpos, ypos):
        """
        Recursively unhide spaces until there are mines surrounding it
        Pre:
            valid x and y coordinates
        Post:
            Boardspaces are unhidden until there are nearby mines
        Args:
            int xpos (row), int ypos (column)
        Returns:
            No return
        """
        if self.m_board[xpos][ypos].isFlagged or self.m_board[xpos][ypos].isMine or not self.m_board[xpos][ypos].isHidden:
            return

        self.m_board[xpos][ypos].isHidden = False
        self.m_revealed += 1

        if self.m_board[xpos][ypos].numMines == 0:
            for x in range(max(xpos - 1, 0), min(xpos + 2, self.m_rows)):
                for y in range(max(ypos - 1, 0), min(ypos + 2, self.m_cols)):
                    if x != xpos or y != ypos:
                        self.recUnhide(x, y)

    # -------------------------
    # methods for Executive to call (excluding initialize)

    # toggleFlag Space if valid
    def toggleFlagSpace(self, row, col):
        """
        Toggles flag on/off
        Pre:
            valid x and y coordinates, has flags remaining
        Post:
            Boardspace flag toggled on/off
        Args:
            int xpos (row), int ypos (column)
        Returns:
            No return
        Raise:
            RuntimeError if no flags remain
        """
        if not self.m_board[row][col].isHidden:
            self.status = "None"
        else:
            self.m_board[row][col].isFlagged = not self.m_board[row][col].isFlagged
            self.status = "DoneF"

    # user clicks a spot
    # returns true if a mine is hit, else false
    def selectSpace(self, row, col):
        """
        Select a space to reveal
        Pre:
            valid x and y coordinates
        Post:
            Either loses game (mine hit) or unhides selected boardspace
        Args:
            int xpos (row), int ypos (column)
        Returns:
            True if mine is hit, else False
        """
        # if self.m_revealed == 0 and self.m_board[row][col].isMine:
        #     self.placeBomb()
        #     self.m_board[row][col].isMine = False
        #     self.calculateNearby()
        #     self.recUnhide(row, col)
        #     if self.userWin():
        #         self.status = "Win"
        #     else:
        #         self.status = "Done"
        #     return

        if self.m_board[row][col].isFlagged or not self.m_board[row][col].isHidden:
            self.status = "None"
            return

        # if the selected space is a mine
        if self.m_board[row][col].isMine:
            self.status = "Lose"
        else:
            # check if this spot is adjacent to other mines
            # if not, reveal 8 surrounding spaces in recursive function
            self.recUnhide(row, col)

            if self.userWin():
                self.status = "Win"
            else:
                self.status = "Done"

    # check if the user has flagged all mines - true if user has won, else false
    def userWin(self):
        """
        Check if the user has flagged all mines, which is victory
        Pre:
            none
        Post:
            none
        Args:
            none
        Returns:
            True if user has won, else False
        """

        if self.m_mines == (self.m_rows*self.m_cols-self.m_revealed):
            return True
        else:
            return False

    def boardToJson(self):
        """
        Generates json to pass to front-end
        Pre:
            none
        Post:
            json file generated
        Args:
            none
        Returns:
            json file with all board information

        """

        myBoard = {}
        myBoard.update({'status': self.status})
        if self.status != "None" and self.status != "DoneF":
            space = 0
            for x in range(0, self.m_rows):
                for y in range(0, self.m_cols):
                    if self.status != "Lose" or (not self.m_board[x][y].isMine or self.m_board[x][y].isFlagged):
                        myBoard.update({str(space): getSpace(self.m_board[x][y])})
                    else:
                        myBoard.update({str(space): "b"})
                    space += 1

        return myBoard


    def cheatModeBoardToJson(self):
        """
        Generates full json to pass to front-end
        Pre:
            none
        Post:
            json string generated
        Args:
            none
        Returns:
            json string with all board information
        """

        myBoard = {}
        space = 0
        self.status="Done"
        myBoard.update({'status': self.status})
        for x in range(0, self.m_rows):
            for y in range(0, self.m_cols):
                myBoard.update({str(space): showSpace(self.m_board[x][y])})
                space += 1
        return myBoard


    # end of Executive call function
    # ------------------------------
