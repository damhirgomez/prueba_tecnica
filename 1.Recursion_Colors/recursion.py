def solve_hanoi_colors(n, disks):
    """
    Resuelve el problema de Torres de Hanoi con restricciones de color.
    
    Restricciones:
    - Un disco solo puede colocarse sobre un disco más grande
    - Un disco no puede colocarse sobre otro disco del mismo color
    
    Args:
        n (int): Número de discos
        disks (list): Lista de tuplas (tamaño, color) ordenadas por tamaño descendente
    
    Returns:
        list: Secuencia de movimientos [(tamaño, origen, destino)] o -1 si es imposible
    """   
    # Verificar si el problema es obviamente imposible
    if is_impossible(disks):
        return -1
    
    # Inicializar estado del juego
    rods = {
        'A': disks.copy(),  # Todos los discos empiezan en A
        'B': [],            # Varilla auxiliar vacía
        'C': []             # Varilla destino vacía
    }
    moves = []
    
    # Intentar resolver usando algoritmo recursivo
    if solve_recursive(n, 'A', 'C', 'B', rods, moves):
        return moves
    else:
        return -1


def is_impossible(disks):
    """
    Verifica si el problema es obviamente imposible de resolver.
    
    Args:
        disks (list): Lista de tuplas (tamaño, color)
    
    Returns:
        bool: True si es imposible, False si podría ser posible
    """
    # Si todos los discos tienen el mismo color, es imposible
    colors = [disk[1] for disk in disks]
    if len(set(colors)) == 1:
        return True
    
    # Si hay más de 2 discos consecutivos del mismo color, es muy difícil
    consecutive_count = 1
    for i in range(1, len(disks)):
        if disks[i][1] == disks[i-1][1]:
            consecutive_count += 1
            if consecutive_count > 2:
                return True
        else:
            consecutive_count = 1
    
    return False


def solve_recursive(n, source, target, auxiliary, rods, moves):
    """
    Resuelve el problema recursivamente usando el algoritmo de Torres de Hanoi
    modificado para manejar restricciones de color.
    
    Args:
        n (int): Número de discos a mover
        source (str): Varilla origen
        target (str): Varilla destino
        auxiliary (str): Varilla auxiliar
        rods (dict): Estado actual de las varillas
        moves (list): Lista de movimientos realizados
    
    Returns:
        bool: True si se pudo resolver, False si no
    """
    # Caso base: sin discos que mover
    if n == 0:
        return True
    
    # Caso base: un disco
    if n == 1:
        return move_single_disk(source, target, auxiliary, rods, moves)
    
    # Paso 1: Mover n-1 discos de source a auxiliary
    if not solve_recursive(n - 1, source, auxiliary, target, rods, moves):
        return False
    
    # Paso 2: Mover el disco más grande de source a target
    if not move_single_disk(source, target, auxiliary, rods, moves):
        return False
    
    # Paso 3: Mover n-1 discos de auxiliary a target
    if not solve_recursive(n - 1, auxiliary, target, source, rods, moves):
        return False
    
    return True


def move_single_disk(source, target, auxiliary, rods, moves):
    """
    Intenta mover un solo disco de source a target.
    Si no es posible directamente, intenta usar la varilla auxiliar.
    
    Args:
        source (str): Varilla origen
        target (str): Varilla destino
        auxiliary (str): Varilla auxiliar
        rods (dict): Estado actual de las varillas
        moves (list): Lista de movimientos realizados
    
    Returns:
        bool: True si se pudo mover, False si no
    """
    # Si la varilla origen está vacía, no hay nada que mover
    if not rods[source]:
        return True
    
    disk = rods[source][-1]
    
    # Intentar mover directamente a target
    if can_place_disk(disk, rods[target]):
        moved_disk = rods[source].pop()
        rods[target].append(moved_disk)
        moves.append((moved_disk[0], source, target))
        return True
    
    # Si no se puede mover directamente, intentar usar auxiliar temporalmente
    if can_place_disk(disk, rods[auxiliary]):
        moved_disk = rods[source].pop()
        rods[auxiliary].append(moved_disk)
        moves.append((moved_disk[0], source, auxiliary))
        return True
    
    # Si no se puede mover a ningún lado, el problema es imposible
    return False


def can_place_disk(disk, rod):
    """
    Verifica si un disco puede ser colocado en una varilla.
    
    Reglas:
    - Se puede colocar en una varilla vacía
    - Solo se puede colocar sobre un disco más grande
    - No se puede colocar sobre un disco del mismo color
    
    Args:
        disk (tuple): Tupla (tamaño, color) del disco
        rod (list): Lista de discos en la varilla
    
    Returns:
        bool: True si se puede colocar, False si no
    """
    # Si la varilla está vacía, siempre se puede colocar
    if not rod:
        return True
    
    # Obtener el disco en la parte superior de la varilla
    top_disk = rod[-1]
    
    # Verificar restricción de tamaño
    if disk[0] >= top_disk[0]:
        return False
    
    # Verificar restricción de color
    if disk[1] == top_disk[1]:
        return False
    
    return True


def print_solution(moves):
    """
    Imprime la solución de manera legible.
    
    Args:
        moves (list): Lista de movimientos o -1 si es imposible
    """
    if moves == -1:
        print("Solución: -1 (Imposible de completar)")
    else:
        print("Secuencia de movimientos:")
        for i, (size, source, target) in enumerate(moves, 1):
            print(f"{i}. Mover disco {size} de {source} a {target}")
        print(f"\nTotal de movimientos: {len(moves)}")


def test_examples():
    """
    Ejecuta las pruebas con los ejemplos dados.
    """
    print("=== EJEMPLO 1 ===")
    n1 = 3
    disks1 = [(3, "red"), (2, "blue"), (1, "red")]
    print(f"Input: n={n1}, disks={disks1}")
    
    result1 = solve_hanoi_colors(n1, disks1)
    print(f"Output: {result1}")
    print_solution(result1)
    
    print("\n=== EJEMPLO 2 (Caso imposible) ===")
    n2 = 3
    disks2 = [(3, "red"), (2, "red"), (1, "red")]
    print(f"Input: n={n2}, disks={disks2}")
    
    result2 = solve_hanoi_colors(n2, disks2)
    print(f"Output: {result2}")
    print_solution(result2)

    print("\n=== EJEMPLO 3 (Caso imposible) ===")
    n3 = 5
    disks3 = [(5, "red"), (4, "blue"), (3, "red"), (2, "green"), (1, "pink")]
    print(f"Input: n={n3}, disks={disks3}")
    
    result3 = solve_hanoi_colors(n3, disks3)
    print(f"Output: {result3}")
    print_solution(result3)


if __name__ == "__main__":
    test_examples()
